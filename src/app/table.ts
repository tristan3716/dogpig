export const gradeTable: Record<string, number[]> = {
  '강력한 환생의 불꽃': [0, 0, 0, 0.2, 0.3, 0.36, 0.14, 0],
  '영원한 환생의 불꽃': [0, 0, 0, 0, 0.29, 0.45, 0.25, 0.01],
};

export function getStatTable(level: number): Record<string, number> {
  return {
    STR: Math.floor(level / 20) + 1,
    DEX: Math.floor(level / 20) + 1,
    INT: Math.floor(level / 20) + 1,
    LUK: Math.floor(level / 20) + 1,
    'STR|DEX': Math.floor(level / 40) + 1,
    'STR|INT': Math.floor(level / 40) + 1,
    'STR|LUK': Math.floor(level / 40) + 1,
    'DEX|INT': Math.floor(level / 40) + 1,
    'DEX|LUK': Math.floor(level / 40) + 1,
    'INT|LUK': Math.floor(level / 40) + 1,
    MaxHP: level * 3,
    MaxMP: level * 3,
    '착용 레벨 감소': -5,
    방어력: Math.floor(level / 20) + 1,
    공격력: 1,
    마력: 1,
    이동속도: 1,
    점프력: 1,
    '올스탯%': 1,
  };
}
