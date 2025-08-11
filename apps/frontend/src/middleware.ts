import { NextResponse } from "next/server";
import type { NextRequest  } from "next/server";



export function middleware(request:NextRequest){

    const accessToken = request.cookies.get('access-token')?.value

    const {pathname} = request.nextUrl

    if(accessToken && (pathname.startsWith('/login') && pathname.startsWith('/signup'))){
        return NextResponse.redirect(new URL('/dashboard',request.url))
    }

    if(!accessToken && pathname.startsWith('dashboard')){
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher:['/dashboard/:path*', '/login', '/signup']
}