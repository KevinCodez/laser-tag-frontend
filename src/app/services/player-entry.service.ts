import { Injectable } from "@angular/core";
import Player from "../Player";
import Team from "../Team";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class PlayerEntryService {
  constructor(private http: HttpClient) {}

  // Set the backend URL
  backendURL = "http://localhost:8080/api";
  //backendURL = "https://laserbacks-backend.herokuapp.com/api";

  // Mock Data - will be deleted when backend is hooked up
  team1MockData: Team = {
    name: "Cowboys",
    color: "blue",
    score: 0,
    players: [],
  };

  team2MockData = {
    name: "Indians",
    color: "red",
    score: 0,
    players: [],
  };

  // Variables
  team1$ = new Subject<Team>();
  team2$ = new Subject<Team>();
  showTransitionScreen$ = new Subject<boolean>();

  team1: Team = this.team1MockData;
  team2: Team = this.team2MockData;

  gameID: number;

  getTeam1(): Team {
    return this.team1;
  }

  getTeam2(): Team {
    return this.team2;
  }

  addPlayer(player: Player, teamNum: number) {
    // Called when adding a new player into the DB
    const pData = { id: player.getID(), codeName: player.getName() };
    this.http.post(`${this.backendURL}/player/`, pData).subscribe();
    if (teamNum === 1) {
      this.team1.players.push(player);
      this.team1$.next(this.team1);
    } else if (teamNum === 2) {
      this.team2.players.push(player);
      this.team2$.next(this.team2);
    }
  }

  removePlayer(id: number) {
    // If ID exists in either team, remove it.
    this.team1.players.filter((player, index) => {
      if (player.getID() === id) {
        this.team1.players.splice(index, 1);
        this.team1$.next(this.team1);
      }
    });

    this.team2.players.filter((player, index) => {
      if (player.getID() === id) {
        this.team2.players.splice(index, 1);
        this.team2$.next(this.team2);
      }
    });
  }

  startGame(): void {
    this.createNewGameBE();
    this.showTransitionScreen$.next(true);
  }

  changeGameState(s: string): void {
    
  }

  createNewGameBE(): Promise<void> {

    const teamData = {
      team1: this.team1.players.map((p) => p.getID()),
      team2: this.team2.players.map((p) => p.getID()),
    };

    return new Promise((resolve, reject) => {
      this.http.post(`${this.backendURL}/game/`, teamData).subscribe(returnedData => {
        try {
          this.gameID = (returnedData as any).id;
          console.log("New game created with ID: " + this.gameID);
          resolve();
        } catch {
          console.log("ERROR: A problem occurred when creating a new game");
          reject();
        }
      });
    });
  }

  fetchPlayerInfo(id: number, teamNum: number): Promise<boolean> {
    // If player is already on a team -> do nothing -> return true
    // Else, query the player ID from DB (using mock data for now)
    // If ID exists, return true
    // Else return false
    // Using setTimeout to simulate async data from backend

    let playerIsAlreadyOnATeam = false;
    this.team1.players.forEach((player) => {
      if (player.getID() == id) {
        // Player is already on a team, do nothing
        playerIsAlreadyOnATeam = true;
      }
    });

    this.team2.players.forEach((player) => {
      if (player.getID() == id) {
        // Player is already on a team, do nothing
        playerIsAlreadyOnATeam = true;
      }
    });

    return new Promise((resolve) => {
      if (playerIsAlreadyOnATeam) {
        resolve(true);
      } else {
        this.http.get(`${this.backendURL}/player/${id}`).subscribe((data) => {
          if (data) {
            const pID = (data as any).id;
            const pName = (data as any).codename;
            if (teamNum === 1) {
              this.team1.players.push(new Player(pID, pName));
              this.team1$.next(this.team1);
            } else if (teamNum === 2) {
              this.team2.players.push(new Player(pID, pName));
              this.team2$.next(this.team2);
            } else {
              resolve(false);
            }
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }
}
