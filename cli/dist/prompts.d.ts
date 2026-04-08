export type Mode = "local" | "production";
export interface InitAnswers {
    mode: Mode;
    apiPort: number;
    domain?: string;
    smtpPort?: number;
}
export declare function askInitQuestions(): Promise<InitAnswers>;
