import { Component, OnInit } from '@angular/core';
import { getStatTable, gradeTable, weightTable } from './table';
import * as Chance from 'chance';
import { EChartsOption } from 'echarts';
import { FormControl, FormGroup } from '@angular/forms';
import { getChart } from './chart';

const chance = new Chance();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  formGroup = new FormGroup({
    level: new FormControl(160),
    type: new FormControl('영원한 환생의 불꽃'),
    mode: new FormControl('본섭'),
    iter: new FormControl(1000),
  });
  logList: Array<Record<string, number>> = [];

  histogramOption: EChartsOption = {};
  inverseCumulativeOption: EChartsOption = {};

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
      const grade = this.getGrade(this.formGroup.value.type);
      for (const s of stats) {
        stat[s] += grade * statTable[item];
      }
    }
    stat.힘급 = stat.STR + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.덱급 = stat.DEX + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.인급 = stat.INT + stat.마력 * 4 + stat['올스탯%'] * 10;
    stat.럭급 = stat.LUK + stat.공격력 * 4 + stat['올스탯%'] * 10;
    stat.제논급 =
      (stat.STR +
        stat.DEX +
        stat.LUK +
        stat.공격력 * 7 +
        stat['올스탯%'] * 20) /
      2;
    stat.급 = Math.max(stat.힘급, stat.덱급, stat.인급, stat.럭급);
    this.logList.push(stat);
  }

  private drawHistogram(): void {
    const category = [];
    const valuesSTR = [];
    const valuesDEX = [];
    const valuesINT = [];
    const valuesLUK = [];
    const valuesXenon = [];
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
      valuesXenon.push(
        this.logList.map((x) => x.제논급).filter((x) => x >= i && x < i + 10)
          .length / this.logList.length
      );
    }
    this.histogramOption = getChart(
      '히스토그램',
      category,
      ['STR', 'DEX', 'INT', 'LUK', 'Xenon'],
      [valuesSTR, valuesDEX, valuesINT, valuesLUK, valuesXenon]
    );
  }

  private drawInverseCumulative(): void {
    const category = [];
    const valuesSTR = [];
    const valuesDEX = [];
    const valuesINT = [];
    const valuesLUK = [];
    const valuesXenon = [];
    for (let i = 0; i <= 200; i += 10) {
      category.push(i);
      valuesSTR.push(
        this.logList.map((x) => x.힘급).filter((x) => x >= i).length /
          this.logList.length
      );
      valuesDEX.push(
        this.logList.map((x) => x.덱급).filter((x) => x >= i).length /
          this.logList.length
      );
      valuesINT.push(
        this.logList.map((x) => x.인급).filter((x) => x >= i).length /
          this.logList.length
      );
      valuesLUK.push(
        this.logList.map((x) => x.럭급).filter((x) => x >= i).length /
          this.logList.length
      );
      valuesXenon.push(
        this.logList.map((x) => x.제논급).filter((x) => x >= i).length /
          this.logList.length
      );
    }
    this.inverseCumulativeOption = getChart(
      '역 누적분포 히스토그램',
      category,
      ['STR', 'DEX', 'INT', 'LUK', 'Xenon'],
      [valuesSTR, valuesDEX, valuesINT, valuesLUK, valuesXenon]
    );
  }

  roll_live(): void {
    const statTable = getStatTable(this.formGroup.value.level);
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
    const statTable = getStatTable(this.formGroup.value.level);
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

  _roll(): void {
    if (this.formGroup.value.mode === '본섭') {
      this.roll_live();
    } else if (this.formGroup.value.mode === '테섭') {
      this.roll_test();
    }
  }

  roll(iter: number): void {
    for (let i = 0; i < iter; i += 1) {
      this._roll();
    }
    this.drawHistogram();
    this.drawInverseCumulative();
  }

  reset(): void {
    this.logList = [];
    this.drawHistogram();
    this.drawInverseCumulative();
  }
}
