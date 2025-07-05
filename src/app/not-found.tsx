import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">Could not find the requested resource</p>
        <Link
          href="/"
          className="px-4 py-2 bg-luxury-gold text-luxury-black rounded hover:bg-luxury-dark-gold inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}