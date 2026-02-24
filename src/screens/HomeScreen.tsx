import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "@/components/MapView";
import RunButton from "@/components/RunButton";
import { LogOut, User } from "lucide-react";
import { logout } from "@/services/auth";
import { toast } from "sonner";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleStartRun = () => {
    toast("Em breve! 🏃", {
      description: "O rastreamento de corrida será implementado na próxima versão.",
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/");
  };

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <h2 className="text-xl font-bold font-display tracking-tight text-primary neon-text">
          WA<span className="text-foreground">Runner</span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-secondary text-foreground">
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView />
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* Bottom action */}
      <div className="relative z-10 px-5 pb-8 pt-2">
        <RunButton onStart={handleStartRun} />
      </div>
    </div>
  );
};

export default HomeScreen;
