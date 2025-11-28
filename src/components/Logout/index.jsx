export function Logout({ closeModal, user, logout }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between gap-6 p-4 text-base text-color_blue font-poppins sm:p-6">
      {/* Título */}
      <h2 className="text-lg font-semibold text-center">
        Tem certeza de que deseja sair?
      </h2>

      {/* Info do usuário */}
      <div className="text-sm text-gray-800 text-center border-y border-gray-200 py-3">
        Sair do <strong>Mira Creative</strong> com <br />
        <span className="text-color_blue font-medium break-words">
          {user.email}
        </span>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <button
          className="w-full sm:w-24 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer transition-transform duration-300 transform hover:scale-105"
          onClick={closeModal}
        >
          Cancelar
        </button>
        <button
          className="w-full sm:w-24 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer transition-transform duration-300 transform hover:scale-105"
          onClick={() => {
            logout();
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
