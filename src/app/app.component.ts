import { Component, OnInit } from '@angular/core';
import { getStatTable, gradeTable, weightTable } from './table';
import * as Chance from 'chance';
import { EChartsOption } from 'echarts';
const chance = new Chance();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dogpig';
  level = 160;
  type = '영원한 환생의 불꽃';
  mode = '본섭';
  logList: Array<Record<string, number>> = [];

  chartOption: EChartsOption = {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: 'bar',
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}

  private pickWeighted(arr: string[]): string {
    if (arr.length === 0) {
      return '';
    }
    return chance.weighted(
      arr,
      arr.map((x) => weightTable[x])
    );
  }

  private pickUniform(arr: string[]): string {
    const random = Math.floor(Math.random() * arr.length);
    return arr[random];
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
    stat.급 = Math.max(
      stat.STR + stat.공격력 * 4 + stat['올스탯%'] * 10,
      stat.DEX + stat.마력 * 4 + stat['올스탯%'] * 10,
      stat.INT + stat.마력 * 4 + stat['올스탯%'] * 10,
      stat.LUK + stat.공격력 * 4 + stat['올스탯%'] * 10
    );
    this.logList.push(stat);

    const numbers = this.logList.map((x) => x.급);
    const category = [];
    const values = [];
    for (let i = 0; i <= 190; i += 10) {
      category.push(i);
      values.push(numbers.filter((x) => x >= i && x < i + 10).length / numbers.length);
    }
    this.chartOption = {
      tooltip: {},
      xAxis: {
        type: 'category',
        data: category,
      },
      yAxis: {
        type: 'value',
        max: Math.max(0.3, ...values),
      },
      series: {
        type: 'bar',
        data: values,
      },
    };
  }

  roll_live(): void {
    const statTable = getStatTable(this.level);
    const statList = Object.keys(statTable);
    const selected = [];

    const result = this.pickWeighted(statList);
    selected.push(result);

    let index = statList.indexOf(result);
    for (let i = 1; i <= 3; i += 1) {
      const statLeft = statList.slice(0, index);
      const statRight = statList.slice(index + 1);
      statList.splice(index, 1);

      const resultLeft = this.pickWeighted(statLeft);
      const resultRight = this.pickWeighted(statRight);
      if (statLeft.length === 0) {
        selected.push(resultRight);
        index = statList.indexOf(resultRight);
      } else if (statRight.length === 0) {
        selected.push(resultLeft);
        index = statList.indexOf(resultLeft);
      } else if (Math.random() < 0.5) {
        selected.push(resultLeft);
        index = statList.indexOf(resultLeft);
      } else {
        selected.push(resultRight);
        index = statList.indexOf(resultRight);
      }
    }

    this.addLog(statTable, selected);
  }

  roll_test(): void {
    const statTable = getStatTable(this.level);
    const statList = Object.keys(statTable);
    const selected = [];

    for (let i = 0; i <= 3; i += 1) {
      const result = this.pickUniform(statList);
      const index = statList.indexOf(result);
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

  roll100(): void {
    for (let i = 0; i < 100; i += 1) {
      this.roll();
    }
  }

  reset(): void {
    this.logList = [];
  }
}
