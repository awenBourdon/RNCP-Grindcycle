import { NextResponse, type NextRequest } from 'next/server';
import { apiSpec } from '@/lib/docs/openapi';
import { auth } from '@/lib/utils/auth';
import { UserRole } from '@/lib/utils/enums/enums';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { success: false, error: 'Non authentifié' },
      { status: 401 },
    );
  }

  return NextResponse.json(apiSpec);
}

