import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
//Agregado
import { ApiService } from '../../services/api.service';
import { formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { JuegoComponent } from '../juego/juego.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, JuegoComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  nombreJugador1: string = '';
  nombreJugador2: string = '';

  //oculto la pestaña de juego
  mostrarJuego: boolean = false;

  partidaId!: number;
  userIdJugador1!: number;
  userIdJugador2!: number;

  //juegoIniciado: boolean = false; // <- NUEVA línea

  constructor(private api: ApiService) {}

  irAJuego(): void {
    if (!this.nombreJugador1 || !this.nombreJugador2) {
      alert('Debe ingresar ambos nombres');
      return;
    }

    // const juegoId = "9986c890-e3a6-4ba3-b18b-5f73e2df8246";
    const fechaActual = formatDate(new Date(), 'yyyy-MM-dd', 'en');

    // 🔎 1. Buscar el juego "G7" ya existente
    this.api.obtenerJuegos().subscribe({
      next: (juegos: any[]) => {
        const juegoExistente = juegos.find(
          (j: any) => j.titulo === 'G7' && j.autores === 'Murillo y Palacios'
        );

        if (!juegoExistente) {
          alert('No se encontró el juego "G7" de Murillo y Palacios');
          return;
        }

        const juegoId = juegoExistente.id;

        const email1 = `${this.nombreJugador1}@gmail.com`;
        const email2 = `${this.nombreJugador2}@gmail.com`;

        // Función para obtener o crear un usuario
        const obtenerOcrearUsuario = (
          nombre: string,
          email: string
        ): Promise<any> => {
          return new Promise((resolve) => {
            this.api.obtenerUsuarioPorCorreo(email).subscribe({
              next: (response: any[]) => {
                console.log('🔍 Respuesta al buscar usuario:', response);

                // Filtrar por juegoId
                const encontrado = response.find(
                  (u) => u.email === email && u.juego_id === juegoId
                );

                console.log('-Verificando si esté el usuario: ', encontrado);
                //                 const encontradoQQ = response.find((u) => {
                //   if (u.email === email && u.juego_id === juegoId) {
                //     console.log('Objeto encontrado:', u.email, "Según id:", u.juego_id);
                //     return true; // Retorna true si la condición se cumple
                //   }
                //   return false; // Retorna false si no se cumple
                // });

                if (encontrado) {
                  console.log('entró');
                  console.log('👀 Usuario ya existe:', encontrado);
                  resolve(encontrado);
                } else {
                  console.log(
                    '🚀 Usuario no encontrado, se procederá a crear uno nuevo'
                  );

                  this.api
                    .crearUsuario(nombre, email, '12345678', juegoId)
                    .subscribe({
                      next: (nuevo: any) => {
                        console.log('✅ Usuario creado:', nuevo);
                        resolve(nuevo);
                      },
                      error: (err) => {
                        console.error('❌ Error creando usuario', err);
                        alert(`Error creando al usuario ${nombre}`);
                      },
                    });
                }
              },
              error: (err) => {
                console.error('Error buscando usuario', err);
                alert(`Error verificando al usuario ${nombre}`);
              },
            });
          });
        };

        // Obtener o crear ambos usuarios
        Promise.all([
          obtenerOcrearUsuario(this.nombreJugador1, email1),
          obtenerOcrearUsuario(this.nombreJugador2, email2),
        ]).then(([user1, user2]) => {
          // 3. Crear partida
          this.api.crearPartida(juegoId, fechaActual, 0, 'Fácil').subscribe({
            next: (partida: any) => {
              const partidaId = partida.id;

              // Guardar partidaId en localStorage para usarlo después
              localStorage.setItem('partidaId', partidaId.toString());
              localStorage.setItem('userIdJugador1', user1.id.toString());
              localStorage.setItem('userIdJugador2', user2.id.toString());

              // 4. Registrar aciertos
              // this.api.registrarAciertos(partidaId, user1.id, 0, 0).subscribe();
              // this.api.registrarAciertos(partidaId, user2.id, 0, 0).subscribe();

              // Guardar nombres en localStorage
              localStorage.setItem('jugador1', this.nombreJugador1);
              localStorage.setItem('jugador2', this.nombreJugador2);

              //Para verificar que se haya guadado la info en el localStor
              console.log(localStorage.getItem('partidaId'));
              console.log(localStorage.getItem('userIdJugador1'));
              console.log(localStorage.getItem('userIdJugador2'));
              console.log(localStorage.getItem('jugador1'));
              console.log(localStorage.getItem('jugador2'));

              // Scroll hacia el juego
              this.mostrarJuego = true;
              const juego = document.getElementById('juego');
              if (juego) juego.scrollIntoView({ behavior: 'smooth' });
            },
            error: (err) => {
              console.error('Error creando partida', err);
              alert('Error creando la partida');
            },
          });
        });
      },
      error: () => alert('Error obteniendo el juego "G7"'),
    });
  }

  volverAlRegistro(): void {
    this.mostrarJuego = false;
    this.nombreJugador1 = '';
    this.nombreJugador2 = '';
  }
}
