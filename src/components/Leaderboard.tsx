
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { PlayerCompetition } from '@/types/supabase';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Medal, Trophy, Users } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Leaderboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLeaderboardData = async (): Promise<PlayerCompetition[]> => {
    const { data, error } = await supabase
      .from('player_competitions')
      .select('*')
      .order('wins', { ascending: false })
      .order('total_games', { ascending: false });

    if (error) {
      throw new Error(`Error fetching leaderboard data: ${error.message}`);
    }
    return data || [];
  };

  const { 
    data: leaderboardData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardData
  });

  // Calculate pagination
  const totalPages = leaderboardData ? Math.ceil(leaderboardData.length / itemsPerPage) : 0;
  const paginatedData = leaderboardData?.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading leaderboard data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Trophy className="h-6 w-6 text-chess-gold" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Losses</TableHead>
                    <TableHead>Draws</TableHead>
                    <TableHead>Total Games</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData && paginatedData.length > 0 ? (
                    paginatedData.map((player, index) => {
                      // Calculate actual rank based on pagination
                      const rank = (currentPage - 1) * itemsPerPage + index + 1;
                      const winRate = player.total_games > 0 
                        ? Math.round((player.wins / player.total_games) * 100) 
                        : 0;
                      
                      return (
                        <TableRow key={player.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {rank <= 3 ? (
                                <Medal 
                                  className={`mr-1 h-5 w-5 ${
                                    rank === 1 ? 'text-chess-gold' :
                                    rank === 2 ? 'text-gray-400' :
                                    'text-amber-700'
                                  }`} 
                                />
                              ) : (
                                <span className="ml-1 w-5 text-center">{rank}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {player.player_name}
                          </TableCell>
                          <TableCell>{player.wins}</TableCell>
                          <TableCell>{player.losses}</TableCell>
                          <TableCell>{player.draws}</TableCell>
                          <TableCell>{player.total_games}</TableCell>
                          <TableCell className="text-right">
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                winRate >= 60 ? 'bg-green-100 text-green-800' :
                                winRate >= 40 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {winRate}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No player data available. Start playing to see the leaderboard!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))} 
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
