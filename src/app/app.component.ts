import { Component, OnInit } from '@angular/core';
import { getStatTable, gradeTable } from './table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dogpig';
  level = 150;
  type = '영원한 환생의 불꽃';
  mode = '본섭';
  logList: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  private arrayPick(arr: string[]): [string, number] {
    const random = Math.floor(Math.random() * arr.length);
    const result = arr[random];
    return [result, random];
  }

  private getGrade(type: string): number {
    const table = gradeTable[type];
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < table.length; i += 1) {
      sum += table[i];
      if (sum > random) {
        return i;
      }
    }
    throw Error('Fail');
  }

  private addLog(statTable: Record<string, number>, selected: string[]): void {
    const stat: Record<string, number> = {};
    const list = Object.keys(statTable);
    for (const item of list) {
      if (selected.includes(item)) {
        const stats = item.split('|');
        for (const s of stats) {
          stat[s] = stat[s] || 0;
          stat[s] += this.getGrade(this.type) * statTable[item];
        }
      } else {
        stat[item] = 0;
      }
    }
    this.logList.push(stat);
  }

  roll_live(): void {
    const statTable = getStatTable(this.level);
    const statList = Object.keys(statTable);
    const selected = [];

    for (let i = 0; i <= 1; i += 1) {
      const [result, index] = this.arrayPick(statList);
      const statLeft = statList.slice(0, index);
      const statRight = statList.slice(index + 1);
      selected.push(result);
      statList.splice(index, 1);

      const [resultLeft, indexLeft] = this.arrayPick(statLeft);
      const [resultRight, indexRight] = this.arrayPick(statRight);
      if (statLeft.length === 0) {
        selected.push(resultRight);
        statList.splice(statList.indexOf(resultRight), 1);
      } else if (statRight.length === 0) {
        selected.push(resultLeft);
        statList.splice(statList.indexOf(resultLeft), 1);
      } else if (Math.random() < 0.5) {
        selected.push(resultLeft);
        statList.splice(statList.indexOf(resultLeft), 1);
      } else {
        selected.push(resultRight);
        statList.splice(statList.indexOf(resultRight), 1);
      }
    }

    this.addLog(statTable, selected);
  }

  roll_test(): void {
    const statTable = getStatTable(this.level);
    const statList = Object.keys(statTable);
    const selected = [];

    for (let i = 0; i <= 3; i += 1) {
      const [result, index] = this.arrayPick(statList);
      selected.push(result);
      statList.splice(index, 1);
    }

    this.addLog(statTable, selected);
  }

  roll(): void {
    if (this.mode === '본섭') {
      this.roll_live();
    } else if (this.mode === '테섭') {
      this.roll_test();
    }
  }

  roll10(): void {
    for (let i = 0; i < 10; i += 1) {
      this.roll();
    }
  }

  reset(): void {
    this.logList = [];
  }
}
