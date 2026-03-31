export type TStory = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  surface: string; // 汤面
  answer: string; // 汤底
  keyPoints: string[];
  hints: {
    level1: string;
    level2: string;
    level3: string;
  };
};

export type TGameState = {
  storyId: string;
  messages: TMessage[];
  questionCount: number;
  hintsUsed: number;
  hitKeyPoints: string[];
  status: 'playing' | 'success' | 'failed';
};

export type TMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};
