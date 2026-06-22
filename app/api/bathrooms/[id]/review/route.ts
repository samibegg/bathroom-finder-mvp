import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { content, rating, doorCode, isVerification } = body;

    const bathroom = await prisma.bathroom.findUnique({ where: { id } });
    if (!bathroom) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (content || rating) {
      await prisma.review.create({
        data: {
          bathroomId: id,
          content: content || null,
          rating: rating ? parseFloat(rating) : null,
        }
      });
    }

    const updates: any = {};
    if (doorCode && doorCode.trim() !== '') {
      updates.doorCode = doorCode.trim();
    }
    
    if (isVerification || doorCode || content || rating) {
      updates.verificationCount = { increment: 1 };
      if (!bathroom.isVerified && bathroom.verificationCount + 1 >= 3) {
        updates.isVerified = true;
      }
    }

    if (rating) {
      const currentRating = bathroom.cleanlinessRating || 3.0;
      const count = Math.max(bathroom.verificationCount, 1);
      updates.cleanlinessRating = ((currentRating * count) + parseFloat(rating)) / (count + 1);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.bathroom.update({
        where: { id },
        data: updates
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
