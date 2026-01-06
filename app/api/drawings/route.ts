import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "drawboard"

async function getDatabase() {
  const client = new MongoClient(uri)
  await client.connect()
  return { client, db: client.db(dbName) }
}

export async function GET() {
  let client: MongoClient | null = null

  try {
    const { client: dbClient, db } = await getDatabase()
    client = dbClient

    const drawings = await db.collection("drawings").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(drawings)
  } catch (error) {
    console.error("[v0] Error fetching drawings:", error)
    return NextResponse.json({ error: "Failed to fetch drawings" }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}

export async function POST(request: Request) {
  let client: MongoClient | null = null

  try {
    const body = await request.json()
    const { imageData } = body

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    const { client: dbClient, db } = await getDatabase()
    client = dbClient

    const result = await db.collection("drawings").insertOne({
      imageData,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ _id: result.insertedId, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error saving drawing:", error)
    return NextResponse.json({ error: "Failed to save drawing" }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
