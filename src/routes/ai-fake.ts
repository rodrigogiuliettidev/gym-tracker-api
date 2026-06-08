import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { WeekDay } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UserProfile {
  name: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

interface WorkoutGoal {
  objective: string;
  daysPerWeek: number;
  hasRestrictions: boolean;
}

const UPPER_IMG_A =
  "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v";
const UPPER_IMG_B =
  "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL";
const LOWER_IMG_A =
  "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj";
const LOWER_IMG_B =
  "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY";

const extractUserProfile = (messages: ChatMessage[]): UserProfile | null => {
  const text = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  const nameMatch = text.match(/(?:meu nome é|me chamo|sou o|sou a)\s+(\w+)/i);
  const weightMatch = text.match(/(\d+)\s*kg/i);
  const heightMatch = text.match(/(\d{3})\s*cm/i);
  const ageMatch = text.match(/(\d{1,2})\s*anos/i);
  const bfMatch = text.match(/(\d{1,2})\s*%?\s*(?:de\s*)?(?:bf|gordura)/i);

  if (!nameMatch || !weightMatch || !heightMatch || !ageMatch || !bfMatch) {
    return null;
  }

  return {
    name: nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1),
    weightInGrams: parseInt(weightMatch[1]) * 1000,
    heightInCentimeters: parseInt(heightMatch[1]),
    age: parseInt(ageMatch[1]),
    bodyFatPercentage: parseInt(bfMatch[1]),
  };
};

const extractWorkoutGoal = (messages: ChatMessage[]): WorkoutGoal | null => {
  const text = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  const daysMatch = text.match(/(\d)\s*x?\s*(?:na|por)\s*semana/i);
  if (!daysMatch) return null;

  const hasGainGoal =
    text.includes("massa") ||
    text.includes("ganho") ||
    text.includes("hipertrofia");
  const hasLossGoal =
    text.includes("emagrecer") ||
    text.includes("perder") ||
    text.includes("gordura");
  const hasCondGoal =
    text.includes("condicionamento") || text.includes("resistência");

  let objective = "ganho de massa muscular";
  if (hasGainGoal && hasLossGoal) objective = "ganho de massa e perda de gordura";
  else if (hasLossGoal) objective = "perda de gordura";
  else if (hasCondGoal) objective = "melhora do condicionamento";

  const restrictionText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const hasRestrictions =
    !restrictionText.toLowerCase().includes("não tenho restrições") &&
    !restrictionText.toLowerCase().includes("nao tenho restrições") &&
    !restrictionText.toLowerCase().includes("sem restrições") &&
    !restrictionText.toLowerCase().includes("nenhuma restrição");

  return {
    objective,
    daysPerWeek: parseInt(daysMatch[1]),
    hasRestrictions,
  };
};

const buildUpperLowerPlan = (name: string) => ({
  name,
  workoutDays: [
    {
      weekDay: WeekDay.MONDAY,
      name: "Superior A - Peito e Costas",
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: UPPER_IMG_A,
      exercises: [
        { order: 1, name: "Supino Reto com Barra", sets: 4, reps: 10, restTimeInSeconds: 90 },
        { order: 2, name: "Remada Curvada com Barra", sets: 4, reps: 10, restTimeInSeconds: 90 },
        { order: 3, name: "Supino Inclinado com Halteres", sets: 3, reps: 12, restTimeInSeconds: 75 },
        { order: 4, name: "Puxada Frontal", sets: 3, reps: 12, restTimeInSeconds: 75 },
        { order: 5, name: "Crucifixo com Halteres", sets: 3, reps: 12, restTimeInSeconds: 60 },
        { order: 6, name: "Remada Unilateral com Halter", sets: 3, reps: 12, restTimeInSeconds: 60 },
      ],
    },
    {
      weekDay: WeekDay.TUESDAY,
      name: "Inferior A - Quadríceps e Glúteos",
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: LOWER_IMG_A,
      exercises: [
        { order: 1, name: "Agachamento Livre", sets: 4, reps: 10, restTimeInSeconds: 120 },
        { order: 2, name: "Leg Press 45°", sets: 4, reps: 12, restTimeInSeconds: 90 },
        { order: 3, name: "Avanço com Halteres", sets: 3, reps: 12, restTimeInSeconds: 75 },
        { order: 4, name: "Cadeira Extensora", sets: 3, reps: 12, restTimeInSeconds: 60 },
        { order: 5, name: "Elevação Pélvica com Barra", sets: 3, reps: 12, restTimeInSeconds: 75 },
        { order: 6, name: "Panturrilha em Pé", sets: 4, reps: 15, restTimeInSeconds: 60 },
      ],
    },
    {
      weekDay: WeekDay.WEDNESDAY,
      name: "Descanso",
      isRest: true,
      estimatedDurationInSeconds: 0,
      coverImageUrl: UPPER_IMG_B,
      exercises: [],
    },
    {
      weekDay: WeekDay.THURSDAY,
      name: "Superior B - Ombros e Braços",
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: UPPER_IMG_B,
      exercises: [
        { order: 1, name: "Desenvolvimento com Barra", sets: 4, reps: 10, restTimeInSeconds: 90 },
        { order: 2, name: "Elevação Lateral com Halteres", sets: 4, reps: 12, restTimeInSeconds: 60 },
        { order: 3, name: "Rosca Direta com Barra", sets: 3, reps: 10, restTimeInSeconds: 75 },
        { order: 4, name: "Tríceps Testa com Barra", sets: 3, reps: 10, restTimeInSeconds: 75 },
        { order: 5, name: "Rosca Alternada com Halteres", sets: 3, reps: 12, restTimeInSeconds: 60 },
        { order: 6, name: "Tríceps Corda no Pulley", sets: 3, reps: 12, restTimeInSeconds: 60 },
      ],
    },
    {
      weekDay: WeekDay.FRIDAY,
      name: "Inferior B - Posterior e Core",
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: LOWER_IMG_B,
      exercises: [
        { order: 1, name: "Levantamento Terra", sets: 4, reps: 8, restTimeInSeconds: 120 },
        { order: 2, name: "Mesa Flexora", sets: 4, reps: 12, restTimeInSeconds: 75 },
        { order: 3, name: "Stiff com Halteres", sets: 3, reps: 12, restTimeInSeconds: 75 },
        { order: 4, name: "Abdução de Quadril na Máquina", sets: 3, reps: 15, restTimeInSeconds: 60 },
        { order: 5, name: "Prancha Abdominal", sets: 3, reps: 40, restTimeInSeconds: 60 },
        { order: 6, name: "Panturrilha Sentado", sets: 4, reps: 15, restTimeInSeconds: 60 },
      ],
    },
    {
      weekDay: WeekDay.SATURDAY,
      name: "Descanso",
      isRest: true,
      estimatedDurationInSeconds: 0,
      coverImageUrl: UPPER_IMG_A,
      exercises: [],
    },
    {
      weekDay: WeekDay.SUNDAY,
      name: "Descanso",
      isRest: true,
      estimatedDurationInSeconds: 0,
      coverImageUrl: UPPER_IMG_B,
      exercises: [],
    },
  ],
});

const determineConversationStep = (
  messages: ChatMessage[],
): | "greeting"
  | "ask_profile"
  | "confirm_profile"
  | "ask_goal"
  | "ask_restrictions"
  | "creating_plan"
  | "done" => {
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");

  if (userMessages.length === 0) return "greeting";

  const profile = extractUserProfile(messages);
  const goal = extractWorkoutGoal(messages);
  const lastUserMsg = userMessages[userMessages.length - 1].content.toLowerCase();

  const askedForPlan =
    messages.some(
      (m) =>
        m.role === "user" &&
        (m.content.toLowerCase().includes("plano de treino") ||
          m.content.toLowerCase().includes("criar treino") ||
          m.content.toLowerCase().includes("montar treino")),
    );

  const answeredRestrictions =
    messages.some(
      (m) =>
        m.role === "user" &&
        (m.content.toLowerCase().includes("restrição") ||
          m.content.toLowerCase().includes("restrições") ||
          m.content.toLowerCase().includes("sem restrição") ||
          m.content.toLowerCase().includes("não tenho") ||
          m.content.toLowerCase().includes("nao tenho") ||
          m.content.toLowerCase().includes("lesão") ||
          m.content.toLowerCase().includes("nenhuma")),
    );

  if (!profile) return "ask_profile";
  if (assistantMessages.length <= 1) return "confirm_profile";
  if (!askedForPlan) return "ask_goal";
  if (!goal) return "ask_goal";
  if (!answeredRestrictions) return "ask_restrictions";

  const alreadyCreated = assistantMessages.some((m) =>
    m.content.includes("plano foi criado") || m.content.includes("Plano criado"),
  );
  if (alreadyCreated) return "done";

  return "creating_plan";
};

export const aiFakeRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["AI Fake"],
      summary: "Chat fake com personal trainer (sem API key)",
      body: z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        ),
      }),
      response: {
        200: z.object({
          message: z.string(),
          workoutPlanCreated: z.boolean(),
        }),
        401: z.object({ error: z.string() }),
        500: z.object({ error: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const userId = session.user.id;
      const { messages } = request.body;

      const step = determineConversationStep(messages);
      const profile = extractUserProfile(messages);
      const goal = extractWorkoutGoal(messages);

      if (step === "greeting" || step === "ask_profile") {
        return reply.send({
          message:
            "Que ótimo! Para começarmos, preciso de algumas informações suas. Qual é o seu nome, peso (em kg), altura (em cm), idade e qual o seu percentual de gordura corporal (um número de 0 a 100)?",
          workoutPlanCreated: false,
        });
      }

      if (step === "confirm_profile" && profile) {
        const upsert = new UpsertUserTrainData();
        await upsert.execute({
          userId,
          weightInGrams: profile.weightInGrams,
          heightInCentimeters: profile.heightInCentimeters,
          age: profile.age,
          bodyFatPercentage: profile.bodyFatPercentage,
        });

        return reply.send({
          message: `Perfeito, ${profile.name}! Seus dados foram salvos com sucesso. Como posso te ajudar hoje? Gostaria de criar um plano de treino?`,
          workoutPlanCreated: false,
        });
      }

      if (step === "ask_goal") {
        return reply.send({
          message:
            "Que legal! Para montar seu plano de treino, preciso saber:\n\nQual é o seu objetivo principal (ex: ganhar massa muscular, emagrecer, melhorar condicionamento)?\n\nQuantos dias por semana você consegue treinar?\n\nVocê tem alguma restrição física ou lesão?",
          workoutPlanCreated: false,
        });
      }

      if (step === "ask_restrictions" && goal) {
        return reply.send({
          message: `Ótimo, ${profile?.name}! Para ${goal.objective}, ${goal.daysPerWeek} dias na semana é uma frequência excelente. Vou montar um plano de treino focado em Upper/Lower (Membros Superiores/Inferiores) para você.\nVocê tem alguma restrição física ou lesão que eu precise saber antes de montar o plano?`,
          workoutPlanCreated: false,
        });
      }

      if (step === "creating_plan" && profile && goal) {
        const planName = `Upper/Lower - ${profile.name}`;
        const plan = buildUpperLowerPlan(planName);

        const createWorkoutPlan = new CreateWorkoutPlan();
        await createWorkoutPlan.execute({
          userId,
          name: plan.name,
          workoutDays: plan.workoutDays,
        });

        return reply.send({
          message: `Pronto, ${profile.name}! Seu plano de treino **${planName}** foi criado com sucesso! 💪\n\nDivisão Upper/Lower para ${goal.daysPerWeek}x na semana:\n- **Segunda**: Superior A (Peito e Costas)\n- **Terça**: Inferior A (Quadríceps e Glúteos)\n- **Quarta**: Descanso\n- **Quinta**: Superior B (Ombros e Braços)\n- **Sexta**: Inferior B (Posterior e Core)\n- **Sábado/Domingo**: Descanso\n\nCada treino tem 6 exercícios com foco em compostos + isoladores. Bons treinos!`,
          workoutPlanCreated: true,
        });
      }

      return reply.send({
        message:
          "Posso te ajudar a criar um plano de treino personalizado! Me conta: qual é o seu objetivo e quantos dias por semana você pode treinar?",
        workoutPlanCreated: false,
      });
    },
  });
};
