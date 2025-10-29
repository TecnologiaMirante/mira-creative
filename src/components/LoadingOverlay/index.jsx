export function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Animated gradient spinner */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600">Aguarde um momento</p>
      </div>
    </div>
  );
}
