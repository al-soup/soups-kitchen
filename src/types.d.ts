export type Habit = {
	id: number;
	action_id: string;
	completed_at: string;
	note?: string;
};

export type Action = {
	id: number;
	type: 1 | 2 | 3;
	level: 1 | 2 | 3 | 4 | 5;
	name: string;
	description: string;
};
