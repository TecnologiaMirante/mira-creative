import { db } from "../../../firebaseClient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { LoadingOverlay } from "../LoadingOverlay";
import { CardUser } from "./CardUser";

export function Team() {
  const [usersTeam, setUsersTeam] = useState([]);
  const [filteredUsersTeam, setFilteredUsersTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "users"), orderBy("display_name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersTeamData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsersTeam(usersTeamData);
      setFilteredUsersTeam(usersTeamData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsersTeam(usersTeam);
    } else {
      const filtered = usersTeam.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsersTeam(filtered);
    }
  }, [searchTerm, usersTeam]);

  if (isLoading) {
    return (
      <LoadingOverlay message={"Carregando usuários..."} success={false} />
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col justify-center items-start space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold ">Usuários</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {filteredUsersTeam.length}{" "}
            {filteredUsersTeam.length === 1
              ? "usuário encontrado"
              : "usuários encontrados"}
          </p>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white shadow-sm border-slate-200 focus-visible:ring-blue-600"
          />
        </div>
      </div>
      {/* Users Grid */}
      {filteredUsersTeam.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsersTeam.map((user) => (
            <CardUser key={user.id} userTeam={user} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <Users className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `Não encontramos usuários para "${searchTerm}"`
                  : "Ainda não há usuários cadastrados no sistema"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
