import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  HelpCircle, 
  Plus, 
  X, 
  Clock,
  Users,
  Trophy,
  Zap
} from 'lucide-react';

interface PollQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  onCreatePoll?: (poll: any) => void;
  onCreateQuiz?: (quiz: any) => void;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

const samplePolls = [
  {
    id: '1',
    question: '다음 컨셉 중 어떤 걸 가장 보고 싶나요?',
    options: [
      { id: '1a', text: '빈티지 스타일', votes: 45 },
      { id: '1b', text: '모던 시크', votes: 32 },
      { id: '1c', text: '로맨틱', votes: 28 },
      { id: '1d', text: '캐주얼', votes: 15 }
    ],
    totalVotes: 120,
    duration: '24시간',
    isActive: true
  }
];

const sampleQuiz = {
  id: '1',
  question: '제가 가장 좋아하는 색깔은?',
  options: [
    { id: '1a', text: '보라색', isCorrect: true },
    { id: '1b', text: '분홍색', isCorrect: false },
    { id: '1c', text: '파란색', isCorrect: false },
    { id: '1d', text: '빨간색', isCorrect: false }
  ],
  reward: '$5 할인 쿠폰',
  participants: 87
};

export function PollQuizDialog({ isOpen, onClose, creatorName, onCreatePoll, onCreateQuiz }: PollQuizDialogProps) {
  const [activeTab, setActiveTab] = useState<'participate' | 'create'>('participate');
  const [selectedPollOption, setSelectedPollOption] = useState<string>('');
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('');
  const [showQuizResult, setShowQuizResult] = useState(false);
  
  // Create Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState('24');
  
  // Create Quiz State
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false }
  ]);
  const [quizReward, setQuizReward] = useState('');

  const handleVotePoll = (optionId: string) => {
    setSelectedPollOption(optionId);
    // 실제로는 서버에 투표 결과 전송
  };

  const handleSubmitQuiz = () => {
    setShowQuizResult(true);
    // 퀴즈 결과 처리
    setTimeout(() => {
      setShowQuizResult(false);
      setSelectedQuizOption('');
    }, 3000);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const addQuizOption = () => {
    if (quizOptions.length < 6) {
      setQuizOptions([
        ...quizOptions,
        { id: Date.now().toString(), text: '', isCorrect: false }
      ]);
    }
  };

  const removeQuizOption = (id: string) => {
    if (quizOptions.length > 2) {
      setQuizOptions(quizOptions.filter(option => option.id !== id));
    }
  };

  const handleCreatePoll = () => {
    const poll = {
      question: pollQuestion,
      options: pollOptions.filter(opt => opt.trim()),
      duration: pollDuration
    };
    onCreatePoll?.(poll);
    // Reset form
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollDuration('24');
    onClose();
  };

  const handleCreateQuiz = () => {
    const quiz = {
      question: quizQuestion,
      options: quizOptions.filter(opt => opt.text.trim()),
      reward: quizReward
    };
    onCreateQuiz?.(quiz);
    // Reset form
    setQuizQuestion('');
    setQuizOptions([
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false }
    ]);
    setQuizReward('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            투표 & 퀴즈
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'participate' | 'create')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participate">참여하기</TabsTrigger>
            <TabsTrigger value="create">만들기</TabsTrigger>
          </TabsList>

          <TabsContent value="participate" className="space-y-4">
            {/* Active Polls */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                진행 중인 투표
              </h3>
              {samplePolls.map((poll) => (
                <Card key={poll.id} className="bg-secondary/20 border-border">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h4 className="font-medium mb-2">{poll.question}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{poll.duration} 남음</span>
                        <Users className="h-3 w-3 ml-2" />
                        <span>{poll.totalVotes}명 참여</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {poll.options.map((option) => {
                        const percentage = (option.votes / poll.totalVotes) * 100;
                        const isSelected = selectedPollOption === option.id;
                        
                        return (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              relative p-3 rounded-lg border cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border bg-background/50 hover:bg-background/80'
                              }
                            `}
                            onClick={() => handleVotePoll(option.id)}
                          >
                            <div className="flex justify-between items-center relative z-10">
                              <span className="font-medium">{option.text}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {option.votes}표
                                </span>
                                <Badge variant="secondary">
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="mt-2 h-2"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quiz Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                오늘의 퀴즈
              </h3>
              <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
                <CardContent className="p-4">
                  {!showQuizResult ? (
                    <>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          {sampleQuiz.question}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>보상: {sampleQuiz.reward}</span>
                          <span>•</span>
                          <span>{sampleQuiz.participants}명 참여</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {sampleQuiz.options.map((option) => (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-all
                              ${selectedQuizOption === option.id
                                ? 'border-primary bg-primary/20' 
                                : 'border-border bg-background/30 hover:bg-background/50'
                              }
                            `}
                            onClick={() => setSelectedQuizOption(option.id)}
                          >
                            <span className="font-medium">{option.text}</span>
                          </motion.div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={!selectedQuizOption}
                        className="w-full bg-gradient-to-r from-primary to-purple-600"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        정답 제출하기
                      </Button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        className="text-6xl mb-4"
                      >
                        🎉
                      </motion.div>
                      <h4 className="font-semibold text-lg mb-2">정답입니다!</h4>
                      <p className="text-muted-foreground mb-4">
                        보상을 받으셨습니다: {sampleQuiz.reward}
                      </p>
                      <Badge className="bg-green-600 text-white">
                        +5 포인트 획득!
                      </Badge>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Tabs defaultValue="poll">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="poll">투표 만들기</TabsTrigger>
                <TabsTrigger value="quiz">퀴즈 만들기</TabsTrigger>
              </TabsList>

              <TabsContent value="poll" className="space-y-4">
                <div>
                  <Label htmlFor="poll-question">투표 질문</Label>
                  <Textarea
                    id="poll-question"
                    placeholder="팬들에게 묻고 싶은 질문을 입력하세요"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <Label>선택지</Label>
                  <div className="space-y-2 mt-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`선택지 ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[index] = e.target.value;
                            setPollOptions(newOptions);
                          }}
                          className="bg-input border-border"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePollOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <Button
                        variant="outline"
                        onClick={addPollOption}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        선택지 추가
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="poll-duration">투표 기간 (시간)</Label>
                  <Input
                    id="poll-duration"
                    type="number"
                    value={pollDuration}
                    onChange={(e) => setPollDuration(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion || pollOptions.filter(opt => opt.trim()).length < 2}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  투표 생성하기
                </Button>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4">
                <div>
                  <Label htmlFor="quiz-question">퀴즈 질문</Label>
                  <Textarea
                    id="quiz-question"
                    placeholder="팬들에게 낼 퀴즈 질문을 입력하세요"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <Label>정답 선택지</Label>
                  <div className="space-y-2 mt-2">
                    {quizOptions.map((option, index) => (
                      <div key={option.id} className="flex gap-2">
                        <Input
                          placeholder={`선택지 ${index + 1}`}
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...quizOptions];
                            newOptions[index].text = e.target.value;
                            setQuizOptions(newOptions);
                          }}
                          className="bg-input border-border"
                        />
                        <Button
                          variant={option.isCorrect ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newOptions = quizOptions.map((opt, i) => ({
                              ...opt,
                              isCorrect: i === index
                            }));
                            setQuizOptions(newOptions);
                          }}
                        >
                          정답
                        </Button>
                        {quizOptions.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuizOption(option.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {quizOptions.length < 6 && (
                      <Button
                        variant="outline"
                        onClick={addQuizOption}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        선택지 추가
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="quiz-reward">보상</Label>
                  <Input
                    id="quiz-reward"
                    placeholder="정답자에게 줄 보상 (예: $5 할인쿠폰, 특별 콘텐츠 등)"
                    value={quizReward}
                    onChange={(e) => setQuizReward(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleCreateQuiz}
                  disabled={!quizQuestion || quizOptions.filter(opt => opt.text.trim()).length < 2 || !quizOptions.some(opt => opt.isCorrect)}
                  className="w-full bg-gradient-to-r from-primary to-purple-600"
                >
                  퀴즈 생성하기
                </Button>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}