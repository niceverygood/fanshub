import { ArrowLeft, MessageCircle, Mail, HelpCircle, FileText, CreditCard, Shield, Users, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface HelpPageProps {
  onBack: () => void;
}

export function HelpPage({ onBack }: HelpPageProps) {
  const faqItems = [
    {
      question: "구독을 취소하려면 어떻게 하나요?",
      answer: "크리에이터 프로필 페이지에서 '구독 중' 버튼을 클릭하면 구독 관리 창이 열립니다. 여기서 '구독 취소'를 선택하면 됩니다. 구독은 현재 결제 주기가 끝날 때까지 유효합니다."
    },
    {
      question: "결제 수단을 변경하려면 어떻게 하나요?",
      answer: "내 프로필 > 카드 탭에서 기본 결제 수단을 변경할 수 있습니다. 새 카드를 추가하고 기본값으로 설정하면 이후 모든 결제에 해당 카드가 사용됩니다."
    },
    {
      question: "환불 정책은 어떻게 되나요?",
      answer: "디지털 콘텐츠 특성상 구매 후 환불이 제한됩니다. 단, 콘텐츠 미제공이나 기술적 문제로 인한 경우 고객센터를 통해 환불을 요청하실 수 있습니다."
    },
    {
      question: "메시지는 어떻게 보내나요?",
      answer: "구독 중인 크리에이터에게만 메시지를 보낼 수 있습니다. 크리에이터 프로필 페이지에서 '메시지' 버튼을 클릭하거나, 하단 메뉴의 '메시지' 탭에서 대화를 시작할 수 있습니다."
    },
    {
      question: "팁은 어떻게 보내나요?",
      answer: "크리에이터의 피드나 프로필 페이지에서 '팁' 버튼을 클릭하여 금액을 선택하고 메시지와 함께 보낼 수 있습니다. 팁은 즉시 크리에이터에게 전달됩니다."
    },
    {
      question: "프리미엄 콘텐츠는 무엇인가요?",
      answer: "프리미엄 콘텐츠는 구독과 별도로 개별 구매해야 하는 특별 콘텐츠입니다. 구매 후 영구적으로 접근할 수 있습니다."
    }
  ];

  const helpCategories = [
    { icon: Users, title: "구독 관련", description: "구독, 결제, 취소 안내" },
    { icon: CreditCard, title: "결제 관련", description: "카드 등록, 환불 안내" },
    { icon: Shield, title: "개인정보", description: "계정 보안 및 개인정보" },
    { icon: FileText, title: "이용약관", description: "서비스 이용약관 안내" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">도움말 및 지원</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 빠른 지원 */}
        <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">도움이 필요하신가요?</h3>
                <p className="text-sm text-muted-foreground">24시간 고객 지원팀이 도와드립니다</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                채팅 상담
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Mail className="h-4 w-4" />
                이메일 문의
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 카테고리 */}
        <div className="grid grid-cols-2 gap-3">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">{category.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">자주 묻는 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 추가 안내 */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              원하시는 답변을 찾지 못하셨나요?
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              1:1 문의하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




