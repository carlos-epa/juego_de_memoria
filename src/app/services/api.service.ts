import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators'; // Importar map
import { Observable } from 'rxjs'; // Importar Observable

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://apigame.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) {}

  // crearJuego(titulo: string, autores: string) {
  //   return this.http.post(`${this.baseUrl}/juegos`, { titulo, autores });
  // }

  crearUsuario(
    nombre: string,
    email: string,
    password: string,
    juegoId: number
  ) {
    return this.http.post(`${this.baseUrl}/users`, {
      name: nombre,
      email: email,
      password: password,
      password_confirmation: password,
      juego_id: juegoId,
    });
  }

  crearPartida(juegoId: number, fecha: string, tiempo: number, nivel: string) {
    return this.http.post(`${this.baseUrl}/partidas`, {
      juego_id: juegoId,
      fecha,
      tiempo,
      nivel,
    });
  }

  registrarAciertos(
    partidaId: number,
    userId: number,
    aciertos: number,
    tiempo: number
  ) {
    return this.http.post(`${this.baseUrl}/aciertos`, {
      partida_id: partidaId,
      user_id: userId,
      aciertos: aciertos,
      tiempo: tiempo,
    });
  }

  obtenerUsuarioPorCorreo(email: string) {
    return this.http.get<any[]>(`${this.baseUrl}/users?mail=${email}`); // ← mail en lugar de email
  }

  obtenerJuegos() {
    return this.http.get<any[]>(`${this.baseUrl}/juegos`);
  }

  // Obtener partidas asociadas a un juego
  obtenerPartidasPorJuego(juegoId: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/partidas`)
      .pipe(
        map((partidas) =>
          partidas.filter((partida) => partida.juego_id === juegoId)
        )
      );
  }

  // Obtener aciertos asociados a una lista de partidas
  obtenerAciertosPorPartidas(partidasIds: number[]): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/aciertos`)
      .pipe(
        map((aciertos) =>
          aciertos.filter((acierto) => partidasIds.includes(acierto.partida_id))
        )
      );
  }

  obtenerAciertos() {
    return this.http.get<any[]>(`${this.baseUrl}/aciertos`);
  }

  obtenerUsuarios() {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }
}
