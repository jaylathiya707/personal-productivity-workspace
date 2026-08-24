import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.improveItem.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching improve items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, status } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const item = await prisma.improveItem.create({
      data: {
        title,
        description: description || null,
        status: status || 'NOT_STARTED',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating improve item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
