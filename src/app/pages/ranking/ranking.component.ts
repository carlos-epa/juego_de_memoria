import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule], // Importa CommonModule
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
})
export class RankingComponent implements OnInit {
  ranking: any[] = [];
  juegoId: string = '9986c890-e3a6-4ba3-b18b-5f73e2df8246';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.generarRanking();
  }

  volverAlJuego(): void {
  this.router.navigate(['/home']);
}

  generarRanking(): void {
    this.apiService.obtenerUsuarios().subscribe((usuarios) => {
      // Filtrar solo usuarios que pertenecen a este juego
      const usuariosDelJuego = usuarios.filter(
        (user) => String(user.juego_id) === this.juegoId
      );

      const userMap = new Map<number, string>();
      const userIdsDelJuego = new Set<number>();

      usuariosDelJuego.forEach((user) => {
        userMap.set(user.id, user.name);
        userIdsDelJuego.add(user.id);
      });

      this.apiService.obtenerAciertos().subscribe((aciertos) => {
        const partidasAgrupadas = new Map<number, any[]>();

        // Agrupar aciertos por partida
        for (const acierto of aciertos) {
          if (!partidasAgrupadas.has(acierto.partida_id)) {
            partidasAgrupadas.set(acierto.partida_id, []);
          }
          partidasAgrupadas.get(acierto.partida_id)!.push(acierto);
        }

        const rankingMap = new Map<
          number,
          { nombre: string; victorias: number }
        >();

        // Recorremos cada partida
        partidasAgrupadas.forEach((aciertosPartida) => {
          // Buscar el mayor número de aciertos de esa partida
          const maxAciertos = Math.max(
            ...aciertosPartida.map((a) => a.aciertos)
          );

          // Encontrar todos los jugadores con ese máximo
          const ganadores = aciertosPartida.filter(
            (a) => a.aciertos === maxAciertos && userIdsDelJuego.has(a.user_id)
          );

          for (const ganador of ganadores) {
            const userId = ganador.user_id;
            const nombre = userMap.get(userId) || `Usuario ${userId}`;
            const prev = rankingMap.get(userId);

            rankingMap.set(userId, {
              nombre,
              victorias: (prev?.victorias || 0) + 1,
            });
          }
        });

        console.log(
          'Usuarios con victorias:',
          Array.from(rankingMap.entries())
        );
        // Ordenar el ranking
        this.ranking = Array.from(rankingMap.values())
          .sort((a, b) => b.victorias - a.victorias)
          .slice(0, 10);
      });
    });
  }
}
