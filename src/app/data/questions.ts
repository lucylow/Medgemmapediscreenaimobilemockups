import { DomainType, QuestionAnswer } from "./types";

interface AgeBandQuestions {
  ageRange: [number, number];
  label: string;
  domains: Record<DomainType, QuestionAnswer[]>;
}

const q = (id: string, prompt: string, helperText?: string): QuestionAnswer => ({
  id,
  prompt,
  helperText,
  answer: null,
});

export const AGE_BAND_QUESTIONS: AgeBandQuestions[] = [
  {
    ageRange: [0, 11],
    label: "0-11 months",
    domains: {
      communication: [
        q("c01-0", "Does your baby make sounds like 'ba-ba' or 'da-da'?", "Listen for repeated syllables during play"),
        q("c02-0", "Does your baby turn to look at you when you call their name?"),
        q("c03-0", "Does your baby smile or laugh when you talk to them?"),
      ],
      gross_motor: [
        q("gm01-0", "Does your baby hold their head up when lying on their tummy?"),
        q("gm02-0", "Does your baby roll over from tummy to back?"),
        q("gm03-0", "Does your baby sit without help for a few seconds?"),
      ],
      fine_motor: [
        q("fm01-0", "Does your baby reach for and grab toys?"),
        q("fm02-0", "Does your baby pass a toy from one hand to the other?"),
        q("fm03-0", "Does your baby pick up small things using fingers and thumb?", "Like a small cracker or piece of cereal"),
      ],
      social: [
        q("s01-0", "Does your baby smile at people?"),
        q("s02-0", "Does your baby like to play peek-a-boo?"),
        q("s03-0", "Does your baby show different emotions (happy, sad, upset)?"),
      ],
      cognitive: [
        q("cg01-0", "Does your baby look at things you point to?"),
        q("cg02-0", "Does your baby explore toys in different ways (shaking, banging)?"),
        q("cg03-0", "Does your baby look for a toy when you hide it under a cloth?"),
      ],
    },
  },
  {
    ageRange: [12, 17],
    label: "12-17 months",
    domains: {
      communication: [
        q("c01-12", "Does your child say one or two words like 'mama' or 'dada' with meaning?"),
        q("c02-12", "Does your child point to things they want?"),
        q("c03-12", "Does your child understand simple words like 'no' or 'bye-bye'?"),
        q("c04-12", "Does your child try to copy words you say?"),
      ],
      gross_motor: [
        q("gm01-12", "Does your child pull up to stand using furniture?"),
        q("gm02-12", "Does your child walk holding onto furniture?"),
        q("gm03-12", "Does your child take a few steps without holding on?"),
      ],
      fine_motor: [
        q("fm01-12", "Does your child pick up small objects with thumb and one finger?"),
        q("fm02-12", "Does your child put things into a container?"),
        q("fm03-12", "Does your child stack two or more blocks?"),
      ],
      social: [
        q("s01-12", "Does your child play simple games like pat-a-cake?"),
        q("s02-12", "Does your child show you toys or things they find interesting?"),
        q("s03-12", "Does your child wave bye-bye?"),
      ],
      cognitive: [
        q("cg01-12", "Does your child look at the right picture when you name it?"),
        q("cg02-12", "Does your child try to use things the right way (phone to ear, cup for drinking)?"),
        q("cg03-12", "Does your child find things even when hidden?"),
      ],
    },
  },
  {
    ageRange: [18, 23],
    label: "18-23 months",
    domains: {
      communication: [
        q("c01-18", "Does your child say at least 10 words?"),
        q("c02-18", "Does your child point to body parts when you name them?"),
        q("c03-18", "Does your child try to say words for things they want?", "Instead of just pointing or crying"),
        q("c04-18", "Does your child follow simple directions like 'give me the ball'?"),
      ],
      gross_motor: [
        q("gm01-18", "Does your child walk without help?"),
        q("gm02-18", "Does your child run, even if they fall sometimes?"),
        q("gm03-18", "Does your child climb onto low furniture?"),
      ],
      fine_motor: [
        q("fm01-18", "Does your child scribble with a crayon?"),
        q("fm02-18", "Does your child stack 3 or more blocks?"),
        q("fm03-18", "Does your child turn pages of a book (even several at once)?"),
      ],
      social: [
        q("s01-18", "Does your child show interest in other children?"),
        q("s02-18", "Does your child copy things you do (sweeping, wiping)?"),
        q("s03-18", "Does your child show affection (hugging a doll or stuffed animal)?"),
      ],
      cognitive: [
        q("cg01-18", "Does your child explore surroundings in new ways?"),
        q("cg02-18", "Does your child know what common things are for (spoon, brush)?"),
        q("cg03-18", "Does your child point to get your attention to show you something?"),
      ],
    },
  },
  {
    ageRange: [24, 35],
    label: "24-35 months",
    domains: {
      communication: [
        q("c01-24", "Does your child join two words together, like 'more milk' or 'big truck'?"),
        q("c02-24", "Does your child use at least 50 words?"),
        q("c03-24", "Can strangers understand at least half of what your child says?"),
        q("c04-24", "Does your child follow two-step instructions like 'get your shoes and bring them to me'?"),
        q("c05-24", "Does your child name things in pictures when you ask 'what is this?'?"),
      ],
      gross_motor: [
        q("gm01-24", "Does your child kick a ball forward?"),
        q("gm02-24", "Does your child run fairly well without falling often?"),
        q("gm03-24", "Does your child walk up stairs holding the railing?"),
        q("gm04-24", "Does your child jump off the ground with both feet?"),
      ],
      fine_motor: [
        q("fm01-24", "Does your child stack 6 or more blocks?"),
        q("fm02-24", "Does your child turn door knobs or unscrew lids?"),
        q("fm03-24", "Does your child copy a straight line when you draw one?"),
        q("fm04-24", "Does your child use a spoon or fork to eat?"),
      ],
      social: [
        q("s01-24", "Does your child play next to other children?"),
        q("s02-24", "Does your child show a wider range of emotions?"),
        q("s03-24", "Does your child notice when others are upset?"),
        q("s04-24", "Does your child show more independence (wanting to do things by themselves)?"),
      ],
      cognitive: [
        q("cg01-24", "Does your child sort shapes or colors?"),
        q("cg02-24", "Does your child complete simple puzzles (2-3 pieces)?"),
        q("cg03-24", "Does your child play simple make-believe (feeding a doll)?"),
        q("cg04-24", "Does your child follow simple instructions without gestures?"),
      ],
    },
  },
  {
    ageRange: [36, 60],
    label: "36-60 months",
    domains: {
      communication: [
        q("c01-36", "Does your child speak in sentences of 3 or more words?"),
        q("c02-36", "Can most people understand what your child says?"),
        q("c03-36", "Does your child answer simple 'who', 'what', and 'where' questions?"),
        q("c04-36", "Does your child tell you about their day or make up stories?"),
        q("c05-36", "Does your child use words like 'I', 'me', 'you', 'we' correctly?"),
      ],
      gross_motor: [
        q("gm01-36", "Does your child walk up and down stairs, one foot per step?"),
        q("gm02-36", "Does your child pedal a tricycle?"),
        q("gm03-36", "Does your child catch a large ball?"),
        q("gm04-36", "Does your child hop on one foot?"),
      ],
      fine_motor: [
        q("fm01-36", "Does your child draw a circle when you show them how?"),
        q("fm02-36", "Does your child use scissors to cut paper?", "Even if not on the line"),
        q("fm03-36", "Does your child draw a person with at least 3 body parts?"),
        q("fm04-36", "Does your child button and unbutton some buttons?"),
      ],
      social: [
        q("s01-36", "Does your child take turns during play?"),
        q("s02-36", "Does your child play pretend with other children?"),
        q("s03-36", "Does your child show concern for a friend who is crying?"),
        q("s04-36", "Does your child separate from parents without much fuss?"),
      ],
      cognitive: [
        q("cg01-36", "Does your child name some colors?"),
        q("cg02-36", "Does your child understand counting and know a few numbers?"),
        q("cg03-36", "Does your child understand 'same' and 'different'?"),
        q("cg04-36", "Does your child play board or card games?"),
      ],
    },
  },
];

export function getQuestionsForAge(ageMonths: number): AgeBandQuestions {
  const band = AGE_BAND_QUESTIONS.find(
    (b) => ageMonths >= b.ageRange[0] && ageMonths <= b.ageRange[1]
  );
  return band || AGE_BAND_QUESTIONS[AGE_BAND_QUESTIONS.length - 1];
}
