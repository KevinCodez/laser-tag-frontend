import { Component, OnInit } from "@angular/core";
import Player from "src/app/Player";
import Team from "src/app/Team";
import { GameActionService } from "src/app/services/game-action.service";
import { AppService } from "src/app/services/app.service";
import { PlayerEntryService } from "src/app/services/player-entry.service";

@Component({
  selector: "app-end-game-screen",
  templateUrl: "./end-game-screen.component.html",
  styleUrls: ["./end-game-screen.component.css"],
})
export class EndGameScreenComponent implements OnInit {
  team2MockData: Team = {
    name: "Rappers",
    color: "red",
    score: 1420,
    players: [
      new Player(5, "Biz Bone"),
      new Player(6, "Queen C"),
      new Player(7, "Vanilla Papa"),
      new Player(8, "Gangsta G"),
    ],
  };

  winningTeam: Team;
  players: Player[];

  constructor(
    private gameActionService: GameActionService,
    private appService: AppService,
    private playerEntryService: PlayerEntryService) {

    // Determine winning team
    if (this.gameActionService.team1.score > this.gameActionService.team2.score) {
      this.winningTeam = this.gameActionService.team1;
    } else if (this.gameActionService.team1.score < this.gameActionService.team2.score) {
      this.winningTeam = this.gameActionService.team2;
    } else {
      this.winningTeam = null;
    }

    // Find top three players
    if (this.winningTeam) {

      this.players = this.winningTeam.players;

      function compare(a, b) {
        if (a.getKillCount() < b.getKillCount()) {
          return 1;
        }

        if (a.getKillCount() > b.getKillCount()){
          return -1;
        }

        return 0;
      }
    
      this.players.sort(compare);
    }

  }

  ngOnInit(): void {}

  resetGame() {
    this.playerEntryService.reset();
    this.appService.setStage('player-entry');
  }
}
