
import React from 'react';
import { Link } from 'react-router-dom';
import Leaderboard from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            XadrezArena - Classificação
          </h1>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar ao Jogo
            </Button>
          </Link>
        </div>
        
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;
