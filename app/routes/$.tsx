import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Handle Chrome DevTools and other well-known requests silently
  if (url.pathname.startsWith('/.well-known/')) {
    return new Response(null, { status: 404 });
  }
  
  // For other 404s, return JSON response
  return json(
    { message: "Not Found", path: url.pathname },
    { status: 404 }
  );
}

export default function CatchAll() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Page not found</p>
        <a 
          href="/" 
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
