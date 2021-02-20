import {Component, OnInit} from '@angular/core';
import {getStatTable, gradeTable, weightTable} from './table';
import * as Chance from 'chance';
import {EChartsOption} from 'echarts';

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
  gen_iter = 100;
  logList: Array<Record<string, number>> = [];

  chartOption: EChartsOption = {};

  constructor() {
  }

  ngOnInit(): void {
  }

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
    const stat: Record<string, number> = {
      STR: 0,
      DEX: 0,
      INT: 0,
      LUK: 0,
      MaxHP: 0,
      MaxMP: 0,
      '착용 레벨 감소': 0,
      방어력: 0,
      공격력: 0,
      마력: 0,
      이동속도: 0,
      점프력: 0,
      '올스탯%': 0,
    };
    for (const item of selected) {
      const stats = item.split('|');
      for (const s of stats) {
        stat[s] += this.getGrade(this.type) * statTable[item];
      }
    }
    stat.힘급 = stat.STR + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.덱급 = stat.DEX + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.인급 = stat.INT + stat.마력 * 4 + stat['올스탯%'] * 10;
    stat.럭급 = stat.LUK + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.급 = Math.max(stat.힘급, stat.덱급, stat.인급, stat.럭급);
    this.logList.push(stat);
  }

  private drawChart(): void {
    const category = [];
    const valuesSTR = [];
    const valuesDEX = [];
    const valuesINT = [];
    const valuesLUK = [];
    for (let i = 0; i <= 200; i += 10) {
      category.push(i);
      valuesSTR.push(
        this.logList.map((x) => x.힘급).filter((x) => x >= i && x < i + 10)
          .length / this.logList.length
      );
      valuesDEX.push(
        this.logList.map((x) => x.덱급).filter((x) => x >= i && x < i + 10)
          .length / this.logList.length
      );
      valuesINT.push(
        this.logList.map((x) => x.인급).filter((x) => x >= i && x < i + 10)
          .length / this.logList.length
      );
      valuesLUK.push(
        this.logList.map((x) => x.럭급).filter((x) => x >= i && x < i + 10)
          .length / this.logList.length
      );
    }
    this.chartOption = {
      tooltip: {},
      legend: {
        data: ['STR', 'DEX', 'INT', 'LUK'],
      },
      xAxis: {
        type: 'category',
        data: category,
      },
      yAxis: {
        type: 'value',
        max: 0.3,
      },
      series: [
        {
          type: 'bar',
          name: 'STR',
          data: valuesSTR,
        },
        {
          type: 'bar',
          name: 'DEX',
          data: valuesDEX,
        },
        {
          type: 'bar',
          name: 'INT',
          data: valuesINT,
        },
        {
          type: 'bar',
          name: 'LUK',
          data: valuesLUK,
        },
      ],
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

  roll_no_hero(): void {
    const statTable = getStatTable(this.level);
    const statList = Object.keys(statTable);
    const selected = [];

    for (let i = 1; i <= 4; i += 1) {
      const result = this.pickWeighted(statList);
      selected.push(result);
      statList.forEach((value, index) => {
        if (value === result) {
          statList.splice(index, 1);
        }
      });
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

  roll(skipDraw: boolean = false): void {
    if (this.mode === '본섭') {
      this.roll_live();
    } else if (this.mode === '테섭') {
      this.roll_test();
    } else if (this.mode === '비복원'){
      this.roll_no_hero();
    }
    if(!skipDraw) this.drawChart();
  }

  rollIterate(iterTimes: number = 100): void {
    for (let i = 0; i < iterTimes; i += 1) {
      this.roll(true);
    }
    this.drawChart();
  }

  reset(): void {
    this.logList = [];
    this.drawChart();
  }
}
