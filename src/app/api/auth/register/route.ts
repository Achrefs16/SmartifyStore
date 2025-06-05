import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({ name, email, password });
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: 'Compte créé avec succès', user: userObj },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
} 