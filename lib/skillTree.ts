export type SkillNode = {
  id: string;
  name: string;
  requires?: string[];
};

export const skillTree: SkillNode[] = [];
