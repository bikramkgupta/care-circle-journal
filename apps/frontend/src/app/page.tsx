import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">CareCircle</h1>
        <p className="text-slate-600 text-center mb-8">Your shared journal for better caregiving.</p>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="block w-full text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link 
            href="/demo"
            className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Try the Demo
          </Link>
        </div>
      </div>
    </main>
  );
}
