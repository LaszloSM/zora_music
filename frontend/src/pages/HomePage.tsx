import { useAuthStore } from '../stores/auth';

export function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Bienvenido, {user?.nombres || user?.username}!
        </h1>
        <div className="mb-4">
          <p className="text-gray-600">
            Has iniciado sesión correctamente.
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Tu información:</h2>
          <ul className="space-y-2">
            <li><span className="font-medium">Usuario:</span> {user?.username}</li>
            <li><span className="font-medium">Email:</span> {user?.email}</li>
            <li><span className="font-medium">Rol:</span> {user?.role}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}