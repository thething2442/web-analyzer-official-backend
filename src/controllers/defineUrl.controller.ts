// controllers/job.controller.ts
import type { Request, Response as ExpressResponse } from "express";
import { v4 as uuidv4 } from "uuid";
// Ensure this `db` import correctly provides a Drizzle SQLite client for Turso
import db from "../dbfunctions/db";
import { webAnalyses, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateWebAnalysisDto } from "../dto/define.url.dto"; // Assuming this is your DTO file
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv'
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function createJob(req: Request, res: ExpressResponse) {
  try {
    const dto = plainToInstance(CreateWebAnalysisDto, req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    // CORRECTED: Destructure requestPayload, assuming the prompt is within it
    const { userId, url, requestPayload, geminiModel } = dto;
    // Assuming the actual user prompt string is in requestPayload.details
    const userProvidedPromptString = requestPayload.details;

    let validUserId: string | null = null;

    if (userId) {
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!user) {
        return res.status(400).json({ error: "User does not exist" });
      }
      validUserId = userId;
    }

    const newAnalysisEntry = {
      id: uuidv4(),
      userId: validUserId,
      url,
      // Storing the user's structured request in requestPayload
      requestPayload: JSON.stringify(requestPayload),
      geminiModel: geminiModel || "gemini-1.5-flash", // Ensure this model is available
      status: "PENDING", // Matches schema default, no need for new Date().getTime()
      // createdAt is handled by Drizzle schema default (unixepoch())
    };

    await db.insert(webAnalyses).values(newAnalysisEntry);

    let geminiResponseText: string = "";
    let analysisStatus: "COMPLETED" | "FAILED" = "FAILED"; // Use uppercase directly

    try {
      const model = genAI.getGenerativeModel({ model: newAnalysisEntry.geminiModel });
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            // Combine the user's prompt with the URL for Gemini
            parts: [{ text: `${userProvidedPromptString}: ${newAnalysisEntry.url}` }],
          },
        ],
        // IMPORTANT: Enable the urlContext tool for web analysis
   
      });

      geminiResponseText = result.response.text();
      analysisStatus = "COMPLETED";

    } catch (geminiError) {
      console.error(`Error calling Gemini API for analysis ${newAnalysisEntry.id}:`, geminiError);
      geminiResponseText = `Gemini API call failed: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`;
      analysisStatus = "FAILED";
    }

    // Update webAnalyses with status and response payload
    await db.update(webAnalyses).set({
      status: analysisStatus, // Already uppercase
      responsePayload: geminiResponseText, // Store Gemini text response
      // updatedAt is handled by Drizzle schema default (unixepoch())
    }).where(eq(webAnalyses.id, newAnalysisEntry.id));

    // Retrieve the updated record to return the most accurate state
    const finalAnalysisRecord = await db.select().from(webAnalyses).where(eq(webAnalyses.id, newAnalysisEntry.id)).get();

    return res.status(201).json({
      success: true,
      analysis: finalAnalysisRecord // Return the record directly from DB
    });

  } catch (err) {
    console.error("Error creating analysis:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// LIST ALL ANALYSES
export async function listJobs(req: Request, res: ExpressResponse) { // Consider renaming to listAnalyses
  try {
    const allAnalyses = await db.select().from(webAnalyses);
    return res.status(200).json({ analyses: allAnalyses });
  } catch (err) {
    console.error("Error fetching analyses:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET ANALYSIS BY ID
export async function getJobById(req: Request<{ id: string }>, res: ExpressResponse) { // Consider renaming to getAnalysisById
  try {
    const { id } = req.params;
    const analysisDetails = await db.select().from(webAnalyses).where(eq(webAnalyses.id, id)).get();

    if (!analysisDetails) return res.status(404).json({ error: "Analysis not found" });

    // The response output is now directly in responsePayload
    const analysis = {
      ...analysisDetails,
      output: analysisDetails.responsePayload || null
    };

    return res.status(200).json({ analysis });
  } catch (err) {
    console.error("Error fetching analysis:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET ALL ANALYSES BY USER ID
export async function getJobsByUserId(req: Request<{ userId: string }>, res: ExpressResponse) { // Consider renaming to getAnalysesByUserId
  try {
    const { userId } = req.params;
    const userAnalyses = await db.select().from(webAnalyses).where(eq(webAnalyses.userId, userId));
    return res.status(200).json({ analyses: userAnalyses });
  } catch (err) {
    console.error("Error fetching user analyses:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}