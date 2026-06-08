import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { QuizCategory } from "../src/generated/prisma/enums.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const questions: Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: QuizCategory;
  date: string;
}> = [
  {
    date: "2026-01-01",
    category: QuizCategory.NUTRITION,
    question: "Qual macronutriente é mais importante para a síntese muscular?",
    options: ["Carboidrato", "Proteína", "Gordura", "Fibra"],
    correctIndex: 1,
    explanation:
      "A proteína fornece os aminoácidos necessários para reparar e construir fibras musculares após o treino. O consumo recomendado é de 1,6–2,2 g por kg de peso corporal.",
  },
  {
    date: "2026-01-02",
    category: QuizCategory.TRAINING,
    question: "Qual é o intervalo de repetições mais indicado para hipertrofia muscular?",
    options: ["1–3 reps", "4–6 reps", "8–12 reps", "20–30 reps"],
    correctIndex: 2,
    explanation:
      "A faixa de 8–12 repetições com carga moderada (65–80% do RM) é a mais estudada para hipertrofia, pois combina tensão mecânica e estresse metabólico de forma eficiente.",
  },
  {
    date: "2026-01-03",
    category: QuizCategory.NUTRITION,
    question: "Quantas gramas de proteína existem em 100g de frango grelhado?",
    options: ["15g", "22g", "31g", "45g"],
    correctIndex: 2,
    explanation:
      "O peito de frango grelhado contém cerca de 31g de proteína por 100g, com baixo teor de gordura, sendo uma das fontes proteicas mais eficientes para atletas.",
  },
  {
    date: "2026-01-04",
    category: QuizCategory.TRAINING,
    question: "O que é o princípio da sobrecarga progressiva?",
    options: [
      "Treinar mais horas por dia",
      "Aumentar gradualmente o estímulo para continuar gerando adaptação",
      "Alternar grupos musculares em cada sessão",
      "Reduzir o descanso entre séries",
    ],
    correctIndex: 1,
    explanation:
      "A sobrecarga progressiva consiste em aumentar gradualmente o volume, intensidade ou frequência do treino para que o corpo continue se adaptando e o músculo continue crescendo.",
  },
  {
    date: "2026-01-05",
    category: QuizCategory.NUTRITION,
    question: "Qual é a principal função dos carboidratos para quem treina?",
    options: [
      "Construir músculo",
      "Fornecer energia para o treino",
      "Queimar gordura",
      "Regular hormônios",
    ],
    correctIndex: 1,
    explanation:
      "Os carboidratos são a principal fonte de energia durante exercícios de alta intensidade. Eles são convertidos em glicogênio muscular, que é utilizado como combustível durante o treino.",
  },
  {
    date: "2026-01-06",
    category: QuizCategory.TRAINING,
    question: "Qual é o papel do descanso entre treinos de força?",
    options: [
      "Reduzir a fadiga mental",
      "Permitir a recuperação e supercompensação muscular",
      "Aumentar a flexibilidade",
      "Melhorar a coordenação",
    ],
    correctIndex: 1,
    explanation:
      "O descanso permite que o corpo repare as microrroturas musculares causadas pelo treino e realize a supercompensação, tornando o músculo mais forte e volumoso que antes.",
  },
  {
    date: "2026-01-07",
    category: QuizCategory.NUTRITION,
    question: "Qual vitamina é produzida pelo corpo com a exposição ao sol?",
    options: ["Vitamina A", "Vitamina B12", "Vitamina C", "Vitamina D"],
    correctIndex: 3,
    explanation:
      "A vitamina D é sintetizada na pele pela exposição aos raios UVB do sol. Ela é fundamental para a absorção de cálcio, saúde óssea e função muscular.",
  },
  {
    date: "2026-01-08",
    category: QuizCategory.TRAINING,
    question: "O que é uma repetição máxima (1RM)?",
    options: [
      "O número máximo de reps em um minuto",
      "A carga máxima que você consegue mover uma única vez",
      "O tempo máximo de contração muscular",
      "A maior série já realizada",
    ],
    correctIndex: 1,
    explanation:
      "1RM (1 repetição máxima) é o peso máximo que uma pessoa consegue levantar em um único movimento com técnica correta. É usada como referência para prescrever cargas de treino.",
  },
  {
    date: "2026-01-09",
    category: QuizCategory.NUTRITION,
    question: "Qual é o melhor momento para consumir proteína após o treino?",
    options: [
      "Imediatamente, dentro de 30 minutos",
      "Apenas no jantar",
      "Dentro das próximas 2 horas é suficiente",
      "Somente no dia seguinte",
    ],
    correctIndex: 2,
    explanation:
      "Pesquisas recentes mostram que a 'janela anabólica' é mais ampla do que se pensava. Consumir proteína dentro de 2 horas após o treino é eficiente para a síntese muscular.",
  },
  {
    date: "2026-01-10",
    category: QuizCategory.TRAINING,
    question: "Qual exercício é considerado o melhor para desenvolvimento global do quadríceps?",
    options: ["Leg press", "Cadeira extensora", "Agachamento livre", "Hack squat"],
    correctIndex: 2,
    explanation:
      "O agachamento livre recruta os quatro músculos do quadríceps, além de glúteos, isquiotibiais e core, sendo considerado o exercício mais completo para o desenvolvimento das pernas.",
  },
  {
    date: "2026-01-11",
    category: QuizCategory.NUTRITION,
    question: "Quantas calorias tem 1 grama de proteína?",
    options: ["4 kcal", "7 kcal", "9 kcal", "11 kcal"],
    correctIndex: 0,
    explanation:
      "Proteína e carboidrato fornecem 4 kcal por grama, enquanto gordura fornece 9 kcal por grama. Esse dado é fundamental para calcular a ingestão calórica diária.",
  },
  {
    date: "2026-01-12",
    category: QuizCategory.TRAINING,
    question: "O que é o treinamento de força excêntrica?",
    options: [
      "Treinar apenas com o peso corporal",
      "Fase de alongamento controlado do músculo sob carga",
      "Treinar com faixas elásticas",
      "Contrair o músculo sem movimento",
    ],
    correctIndex: 1,
    explanation:
      "A fase excêntrica é quando o músculo se alonga sob tensão (ex: descer o peso no supino). Ela gera mais dano muscular e estímulo de crescimento que a fase concêntrica.",
  },
  {
    date: "2026-01-13",
    category: QuizCategory.NUTRITION,
    question: "Qual alimento é rico em ômega-3?",
    options: ["Arroz branco", "Salmão", "Frango", "Batata doce"],
    correctIndex: 1,
    explanation:
      "O salmão é uma das principais fontes de ômega-3 (EPA e DHA), ácidos graxos essenciais que reduzem inflamação, melhoram a recuperação muscular e protegem o coração.",
  },
  {
    date: "2026-01-14",
    category: QuizCategory.TRAINING,
    question: "Qual é o benefício principal do treino de mobilidade?",
    options: [
      "Aumentar a massa muscular",
      "Reduzir a frequência cardíaca",
      "Melhorar a amplitude de movimento e prevenir lesões",
      "Aumentar o VO2 máximo",
    ],
    correctIndex: 2,
    explanation:
      "O treino de mobilidade melhora a amplitude de movimento das articulações, melhora a técnica dos exercícios e reduz significativamente o risco de lesões.",
  },
  {
    date: "2026-01-15",
    category: QuizCategory.NUTRITION,
    question: "O que é déficit calórico?",
    options: [
      "Consumir mais calorias do que gasta",
      "Consumir menos calorias do que gasta",
      "Manter as calorias iguais ao gasto",
      "Eliminar completamente os carboidratos",
    ],
    correctIndex: 1,
    explanation:
      "Déficit calórico ocorre quando você consome menos calorias do que seu corpo gasta. Isso força o organismo a usar as reservas de gordura como energia, resultando em perda de peso.",
  },
];

const seedQuiz = async () => {
  console.log("Seeding quiz questions...");

  for (const q of questions) {
    await prisma.quizQuestion.upsert({
      where: { id: q.date },
      update: {},
      create: {
        id: q.date,
        ...q,
      },
    });
  }

  console.log(`Seeded ${questions.length} quiz questions.`);
};

seedQuiz()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
