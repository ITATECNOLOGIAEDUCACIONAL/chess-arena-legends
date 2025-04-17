
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HeaderBar: React.FC = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        XadrezArena
      </h1>
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-sm mr-4">
            Olá, <span className="font-semibold">{user.email?.split('@')[0]}</span>
          </div>
        )}
        
        {user ? (
          <Button variant="outline" size="sm" onClick={signOut} className="mr-3">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        ) : null}
        
        <Link to="/leaderboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Ver Classificação
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeaderBar;
