export type AgeBand = "0-3" | "4-6" | "7-9" | "10-12" | "13-18" | "19-24" | "25-36" | "37-48" | "49-60";

export function getAgeBand(ageMonths: number): AgeBand {
  if (ageMonths <= 3) return "0-3";
  if (ageMonths <= 6) return "4-6";
  if (ageMonths <= 9) return "7-9";
  if (ageMonths <= 12) return "10-12";
  if (ageMonths <= 18) return "13-18";
  if (ageMonths <= 24) return "19-24";
  if (ageMonths <= 36) return "25-36";
  if (ageMonths <= 48) return "37-48";
  return "49-60";
}

interface DomainObservations {
  on_track: string[];
  monitor: string[];
  concern: string[];
  red_flag: string[];
}

export const COMMUNICATION_OBS: Record<AgeBand, DomainObservations> = {
  "0-3": {
    on_track: [
      "Coos and makes gurgling sounds responsively. Turns head toward familiar voices.",
      "Startles to loud sounds. Makes vowel-like sounds 'ah', 'oh'. Quiets to parent voice.",
      "Smiles at sound of parent voice. Beginning to babble with vowel sounds.",
    ],
    monitor: [
      "Limited vocalization, mostly quiet. Does not startle to loud sounds consistently.",
      "Rarely coos or makes sounds. Parent reports concern about hearing responses.",
    ],
    concern: [
      "No vocalization observed at 3 months. Does not respond to sounds or voices.",
      "Silent during entire observation period. No social smile to voice.",
    ],
    red_flag: [
      "No response to any auditory stimuli. No vocalization. No visual tracking of speaker.",
    ],
  },
  "4-6": {
    on_track: [
      "Babbles with consonant-vowel combinations 'ba-ba', 'da-da'. Responds to own name.",
      "Laughs out loud. Makes squealing sounds. Turns to source of sounds.",
      "Vocalizes excitement and displeasure. Beginning canonical babbling.",
    ],
    monitor: [
      "Limited babbling variety. Does not consistently turn to name. Few consonant sounds.",
      "Quiet baby, occasional cooing but no consonant-vowel babbling yet.",
    ],
    concern: [
      "No babbling at 6 months. Does not respond to name. Very limited sound repertoire.",
    ],
    red_flag: [
      "No babbling, no response to name, no vocalization. Previously babbled but stopped.",
    ],
  },
  "7-9": {
    on_track: [
      "Varied babbling with multiple consonants. Uses gestures like waving. Responds to 'no'.",
      "Says 'mama/dada' nonspecifically. Points at objects. Understands simple words.",
      "Imitates sounds. Uses voice to get attention. Babbling sounds speech-like.",
    ],
    monitor: [
      "Limited babbling variety. No gestures like pointing or waving. Inconsistent name response.",
      "Does not imitate sounds. Few consonant-vowel combinations. No communicative gestures.",
    ],
    concern: [
      "No varied babbling at 9 months. No gestures. Does not respond to own name.",
    ],
    red_flag: [
      "Loss of previously acquired babbling. No response to name or sounds. No social communication.",
    ],
  },
  "10-12": {
    on_track: [
      "Says 1-3 words meaningfully ('mama', 'dada', 'ball'). Points to show interest. Follows simple directions.",
      "Uses gestures with vocalization. Understands 'no' and simple commands. Imitates words.",
      "Jargon babbling with sentence-like intonation. Says 'uh-oh'. Waves bye-bye.",
    ],
    monitor: [
      "No clear words at 12 months. Limited gestures. Understands some words but doesn't produce them.",
      "Babbles but no true words. Few communicative gestures. Parent concerned about speech.",
    ],
    concern: [
      "No words, no pointing, no gestures at 12 months. Limited understanding of spoken language.",
      "No babbling at 12 months. Does not follow simple commands. No communicative intent.",
    ],
    red_flag: [
      "No babbling at 12 months. No gestures (pointing, waving). No response to name. Regression of sounds.",
    ],
  },
  "13-18": {
    on_track: [
      "Says 6-20 words. Points to body parts. Follows 1-step directions. Uses words to communicate needs.",
      "Vocabulary growing weekly. Says 'more', 'all done'. Points to pictures in books when named.",
      "Uses 15+ words consistently. Attempts 2-word phrases. Understands simple questions.",
    ],
    monitor: [
      "Says fewer than 5 words at 18 months. Points but limited verbal expression. Good comprehension.",
      "Limited vocabulary (~3-5 words). Uses mostly gestures. Parent reports slow word learning.",
    ],
    concern: [
      "No words at 18 months. Does not point to show interest. Limited comprehension of language.",
      "Says only 1-2 words. Does not follow simple directions. No pointing to request.",
    ],
    red_flag: [
      "No words at 18 months. No pointing. Does not follow simple commands. Loss of previously used words.",
    ],
  },
  "19-24": {
    on_track: [
      "Says ~50 words. Uses 2-word combinations ('more milk', 'daddy go'). Follows 2-step commands.",
      "Vocabulary expanding rapidly. Names pictures in books. Uses words to request and comment.",
      "Points to 5+ body parts. Combines words regularly. Understands 'in', 'on', 'under'.",
    ],
    monitor: [
      "Says ~10 single words, points to what he wants instead of asking. Follows simple instructions like 'give me ball'. No word combinations yet.",
      "Limited vocabulary (~15-20 words). Understands well but speaks little. No 2-word phrases.",
    ],
    concern: [
      "Fewer than 10 words at 24 months. No word combinations. Relies heavily on gestures.",
      "Says ~5 words. Does not combine words. Limited understanding of 2-step directions.",
    ],
    red_flag: [
      "No meaningful words at 24 months. No 2-word combinations. Loss of previously used words. No joint attention.",
    ],
  },
  "25-36": {
    on_track: [
      "Uses 200+ words. Speaks in 3-4 word sentences. Asks 'what' and 'where' questions. Mostly understood by familiar adults.",
      "Names colors, shapes. Uses pronouns (I, me, you). Carries on brief conversations.",
      "Follows 2-3 step directions. Tells stories about recent events. Speech 75% intelligible.",
    ],
    monitor: [
      "Uses 2-word phrases but no sentences. Vocabulary ~50 words. Hard to understand by unfamiliar listeners.",
      "Speaks in short phrases. Limited sentence variety. Does not ask questions yet.",
    ],
    concern: [
      "Says fewer than 50 words at 30 months. No sentences. Speech mostly unintelligible.",
      "Limited to single words and a few phrases. Does not follow 2-step directions.",
    ],
    red_flag: [
      "No 2-word phrases by 30 months. Significant regression in language. Echolalia without functional language.",
    ],
  },
  "37-48": {
    on_track: [
      "Speaks in 4-5 word sentences. Tells stories. Understood by strangers most of the time.",
      "Uses past tense. Asks 'why' questions. Knows full name and age. Sings songs.",
      "Follows 3-step directions. Uses conjunctions ('and', 'because'). Speech 90% intelligible.",
    ],
    monitor: [
      "Speaks in 2-3 word sentences. Limited question use. Understood by familiar adults only.",
      "Difficulty with complex sentences. Limited vocabulary for age. Some sound substitutions.",
    ],
    concern: [
      "Speaks in single words or short phrases at 4 years. Very hard to understand.",
    ],
    red_flag: [
      "No sentences by 4 years. Regression of language skills. Very limited social communication.",
    ],
  },
  "49-60": {
    on_track: [
      "Speaks in complex sentences with 5+ words. Tells detailed stories. Understood by all listeners.",
      "Uses future tense. Defines simple words. Can explain rules of a game. Speech fully intelligible.",
      "Follows multi-step directions. Uses 'because' and 'if'. Engages in extended conversations.",
    ],
    monitor: [
      "Speaks in 3-4 word sentences. Some grammatical errors. Difficulty with storytelling.",
      "Understood by familiar adults but struggles with unfamiliar listeners.",
    ],
    concern: [
      "Speaks in short, simple sentences only. Very limited vocabulary for age. Difficulty following directions.",
    ],
    red_flag: [
      "Language significantly below age level. Regression noted. Minimal social communication.",
    ],
  },
};

export const GROSS_MOTOR_OBS: Record<AgeBand, DomainObservations> = {
  "0-3": {
    on_track: [
      "Lifts head during tummy time to 45 degrees. Moves arms and legs equally. Pushes down with legs on flat surface.",
      "Head control improving. Kicks both legs vigorously. Brings hands to midline.",
    ],
    monitor: [
      "Poor head control. Limited leg movement. Does not push up during tummy time.",
    ],
    concern: ["Significant head lag at 3 months. Very stiff or very floppy muscle tone."],
    red_flag: ["No head control. Persistent fisting. Asymmetric movements suggesting hemiparesis."],
  },
  "4-6": {
    on_track: [
      "Rolls both ways. Sits with minimal support. Bears weight on legs when held standing.",
      "Pushes up on extended arms. Reaches for toys. Beginning to sit independently.",
    ],
    monitor: [
      "Does not roll at 6 months. Sits only with full support. Limited weight bearing.",
    ],
    concern: ["Cannot roll at 6 months. No sitting even with support. Poor head control persists."],
    red_flag: ["Cannot hold head up. No rolling. Extreme stiffness or floppiness."],
  },
  "7-9": {
    on_track: [
      "Sits independently without support. Gets to sitting position alone. Crawls or scoots.",
      "Pulls to stand at furniture. Stands holding on. May take sideways steps (cruising).",
    ],
    monitor: [
      "Sits but cannot get into sitting position alone. Not yet pulling to stand. No crawling.",
    ],
    concern: ["Cannot sit unsupported at 9 months. No attempts to pull up or crawl."],
    red_flag: ["Cannot sit even with support. No mobility. Significant asymmetry in movements."],
  },
  "10-12": {
    on_track: [
      "Walks holding furniture (cruising). May take independent steps. Stands alone briefly.",
      "Pulls to stand easily. Walks with one hand held. Gets into standing from sitting.",
    ],
    monitor: [
      "Cruises but no independent steps at 12 months. Prefers scooting over walking attempts.",
    ],
    concern: ["Not pulling to stand at 12 months. No cruising. Prefers only to sit."],
    red_flag: ["Cannot pull to stand. Cannot sit independently. Regression of motor skills."],
  },
  "13-18": {
    on_track: [
      "Walks independently. Stoops and recovers. Begins to run. Climbs onto furniture.",
      "Walks well, climbs stairs holding railing. Carries toys while walking. Kicks a ball forward.",
    ],
    monitor: [
      "Walking but very unsteady at 18 months. Falls frequently. Not yet climbing stairs.",
      "Walks independently but gait appears unusual. Does not attempt to run.",
    ],
    concern: [
      "Not walking independently at 18 months. Can stand but does not take steps.",
    ],
    red_flag: [
      "No walking at 18 months. Cannot stand without support. Loss of previously achieved motor skills.",
    ],
  },
  "19-24": {
    on_track: [
      "Runs well. Kicks ball. Walks up/down stairs with hand held. Jumps with both feet.",
      "Throws ball overhand. Climbs on playground equipment. Walks backward.",
    ],
    monitor: [
      "Walks but cannot run smoothly. Difficulty with stairs. Does not jump.",
    ],
    concern: [
      "Walking is very unsteady at 24 months. Cannot kick a ball. No stair climbing.",
    ],
    red_flag: [
      "Not walking at 24 months. Significant balance issues. Regression of walking ability.",
    ],
  },
  "25-36": {
    on_track: [
      "Runs and climbs well. Pedals a tricycle. Walks up stairs alternating feet. Jumps in place.",
      "Balances briefly on one foot. Throws ball overhand with aim. Catches large ball.",
    ],
    monitor: [
      "Runs but falls frequently. Cannot pedal tricycle. Difficulty with stairs.",
    ],
    concern: [
      "Cannot run at 3 years. Significant difficulty with climbing. Very clumsy.",
    ],
    red_flag: [
      "Cannot walk steadily. Regression of motor skills. Significant muscle weakness.",
    ],
  },
  "37-48": {
    on_track: [
      "Hops on one foot. Catches bounced ball. Rides tricycle well. Walks downstairs alternating feet.",
      "Climbs well. Runs, hops, and skips. Good balance on one foot for 5+ seconds.",
    ],
    monitor: [
      "Cannot hop on one foot. Difficulty catching balls. Unsteady on stairs.",
    ],
    concern: [
      "Cannot run smoothly at 4 years. Falls frequently. Avoids physical activities.",
    ],
    red_flag: ["Cannot climb stairs. Significant motor regression. Muscle weakness or stiffness."],
  },
  "49-60": {
    on_track: [
      "Skips. Does somersaults. Swings, climbs. Hops on one foot for 5+ hops. Catches small ball.",
      "Balances on one foot 10+ seconds. Walks heel-to-toe. Good coordination in running games.",
    ],
    monitor: [
      "Cannot skip or hop well. Poor balance. Avoids playground equipment.",
    ],
    concern: ["Very poor coordination for age. Cannot hop on one foot. Falls frequently."],
    red_flag: ["Significant motor regression. Cannot walk steadily. Muscle weakness."],
  },
};

export const FINE_MOTOR_OBS: Record<AgeBand, DomainObservations> = {
  "0-3": {
    on_track: [
      "Grasps rattle briefly. Opens and closes hands. Brings hands to mouth. Swipes at dangling toys.",
      "Follows objects visually 180 degrees. Holds hands open more than closed.",
    ],
    monitor: [
      "Does not grasp objects placed in hand. Persistent fisting. Limited reaching.",
    ],
    concern: ["No grasping at 3 months. Hands always fisted. Does not track objects."],
    red_flag: ["No visual tracking. Persistent asymmetric hand use. Cannot hold any object."],
  },
  "4-6": {
    on_track: [
      "Reaches and grasps objects with both hands. Transfers objects hand to hand. Rakes at small objects.",
      "Holds bottle with both hands. Bangs objects on surface. Plays with feet.",
    ],
    monitor: [
      "Difficulty grasping objects. Does not transfer hand to hand. Limited reaching.",
    ],
    concern: ["Cannot grasp objects at 6 months. No reaching. Persistent fisting."],
    red_flag: ["No grasping or reaching. Strong hand preference before 12 months."],
  },
  "7-9": {
    on_track: [
      "Uses pincer grasp (thumb and finger). Picks up small objects. Bangs two objects together.",
      "Pokes with index finger. Drops objects deliberately. Feeds self finger foods.",
    ],
    monitor: [
      "No pincer grasp developing. Difficulty picking up small objects. Raking grasp only.",
    ],
    concern: ["Cannot pick up objects. Does not bang objects together. Very poor hand control."],
    red_flag: ["No reaching or grasping. Cannot hold objects. Asymmetric hand function."],
  },
  "10-12": {
    on_track: [
      "Neat pincer grasp. Puts objects in container. Takes objects out. Releases deliberately.",
      "Turns pages of board book (several at a time). Stacks 2 blocks. Scribbles with crayon.",
    ],
    monitor: [
      "Pincer grasp emerging but clumsy. Difficulty with containers. Does not stack blocks.",
    ],
    concern: ["No pincer grasp at 12 months. Cannot pick up small objects."],
    red_flag: ["Cannot hold objects. No fine motor development. Regression of hand skills."],
  },
  "13-18": {
    on_track: [
      "Stacks 2-4 blocks. Scribbles spontaneously. Turns pages of board book. Uses spoon with spilling.",
      "Puts shapes in sorter. Takes off socks/shoes. Drinks from open cup with help.",
    ],
    monitor: [
      "Walks well, climbs stairs holding railing. Stacks 2-3 blocks. Scribbles but doesn't make vertical/horizontal lines.",
      "Does not stack blocks. Scribbles but limited control. Difficulty with spoon.",
    ],
    concern: [
      "Cannot stack blocks at 18 months. No scribbling. Poor grasp of small objects.",
    ],
    red_flag: ["Cannot grasp small objects. No interest in manipulating toys. Hand skill regression."],
  },
  "19-24": {
    on_track: [
      "Stacks 6+ blocks. Turns pages one at a time. Makes vertical and horizontal lines. Uses spoon well.",
      "Strings large beads. Opens jars/containers. Turns doorknobs. Builds simple structures.",
    ],
    monitor: [
      "Stacks 3-4 blocks. Makes marks but not lines. Difficulty with spoon. Uses whole hand grasp.",
    ],
    concern: [
      "Cannot stack blocks beyond 2. No purposeful marking. Very poor hand coordination.",
    ],
    red_flag: ["No stacking or scribbling at 24 months. Regression of fine motor skills."],
  },
  "25-36": {
    on_track: [
      "Copies a circle. Strings small beads. Uses scissors to snip. Dresses self with help. Draws a person (head + 1 part).",
      "Stacks 8+ blocks. Completes simple puzzles. Uses fork and spoon. Turns individual pages.",
    ],
    monitor: [
      "Cannot copy a circle. Difficulty with scissors. Draws only scribbles. Struggles with self-care tasks.",
    ],
    concern: [
      "Cannot draw any recognizable shapes. Very poor pencil control. Cannot stack more than 4 blocks.",
    ],
    red_flag: ["Significant fine motor regression. Cannot hold crayon. Loss of self-care skills."],
  },
  "37-48": {
    on_track: [
      "Draws a person with 2-4 body parts. Copies a cross. Cuts along a line with scissors. Buttons and unbuttons.",
      "Uses fork, knife, spoon properly. Draws simple pictures. Writes some letters. Laces cards.",
    ],
    monitor: [
      "Difficulty drawing a person. Cannot cut along a line. Struggles with buttons.",
    ],
    concern: ["Cannot draw a person at 4 years. Very poor cutting skills. Cannot button."],
    red_flag: ["Cannot hold pencil/crayon. Regression of fine motor skills. Cannot feed self."],
  },
  "49-60": {
    on_track: [
      "Draws a person with 6+ body parts. Copies a square. Prints some letters/numbers. Cuts out simple shapes.",
      "Ties simple knots. Uses knife to spread. Good pencil control. Colors within lines.",
    ],
    monitor: [
      "Draws a person with 2-3 parts. Cannot copy a square. Difficulty with letter formation.",
    ],
    concern: ["Very poor drawing ability for age. Cannot use scissors effectively."],
    red_flag: ["Significant fine motor delay. Cannot hold writing tools. Regression."],
  },
};

export const PROBLEM_SOLVING_OBS: Record<AgeBand, DomainObservations> = {
  "0-3": {
    on_track: [
      "Follows moving objects with eyes. Recognizes familiar people at distance. Begins to act bored if activity doesn't change.",
      "Watches faces intently. Shows interest in new objects. Anticipates feeding routine.",
    ],
    monitor: [
      "Limited interest in surroundings. Does not track objects visually. Seems unaware of environment.",
    ],
    concern: ["No visual tracking. No interest in people or objects."],
    red_flag: ["No visual attention. No recognition of caregiver."],
  },
  "4-6": {
    on_track: [
      "Reaches for nearby toys. Brings things to mouth to explore. Shows curiosity about things out of reach.",
      "Explores objects by mouthing, shaking, banging. Looks for dropped objects briefly.",
    ],
    monitor: [
      "Limited exploration of objects. Does not reach for toys. Seems disinterested.",
    ],
    concern: ["No object exploration at 6 months. Does not reach for toys."],
    red_flag: ["No interest in objects or people. No mouthing or exploration."],
  },
  "7-9": {
    on_track: [
      "Looks for hidden objects (object permanence). Explores objects in different ways. Watches path of falling objects.",
      "Transfers objects hand-to-hand to explore. Finds partially hidden toy. Bangs objects together purposefully.",
    ],
    monitor: [
      "Does not look for hidden objects. Limited object exploration. Short attention span.",
    ],
    concern: ["No object permanence at 9 months. Does not explore toys."],
    red_flag: ["No interest in objects. No exploration or curiosity."],
  },
  "10-12": {
    on_track: [
      "Finds hidden objects. Explores cause-and-effect toys. Imitates gestures. Uses objects correctly (phone to ear).",
      "Pokes with index finger. Tries to get objects that are out of reach. Puts things in container and takes out.",
    ],
    monitor: [
      "Limited problem solving. Does not try to reach objects. No imitation of actions.",
    ],
    concern: ["Cannot find hidden objects at 12 months. No functional object use."],
    red_flag: ["No object permanence. No exploration. No imitation."],
  },
  "13-18": {
    on_track: [
      "Explores objects by turning, poking, dropping. Knows what ordinary objects are for (phone, cup). Points to show things.",
      "Completes simple puzzles (1-2 pieces). Stacks rings on peg. Follows simple instructions with objects.",
    ],
    monitor: [
      "Limited exploration strategies. Does not use objects functionally. Difficulty with simple cause-effect toys.",
    ],
    concern: [
      "No functional object use at 18 months. Cannot complete simple puzzles.",
    ],
    red_flag: ["No problem-solving attempts. No functional play. Regression of cognitive skills."],
  },
  "19-24": {
    on_track: [
      "Completes 3-4 piece puzzles. Sorts objects by shape/color. Begins make-believe play. Finds hidden objects under multiple covers.",
      "Matches objects. Points to pictures when named. Follows 2-step instructions. Names familiar objects.",
    ],
    monitor: [
      "Difficulty with simple puzzles. Limited sorting ability. No pretend play emerging.",
    ],
    concern: [
      "Cannot complete simple puzzles at 24 months. No sorting. No pretend play.",
    ],
    red_flag: ["No problem solving. No pretend play. Regression of cognitive skills."],
  },
  "25-36": {
    on_track: [
      "Completes 6+ piece puzzles. Sorts by color and shape. Counts to 3. Understands 'same' and 'different'. Rich pretend play.",
      "Names colors. Understands 'two'. Plays make-believe with dolls, animals. Turns book pages to find picture.",
    ],
    monitor: [
      "Difficulty with puzzles beyond 3 pieces. Cannot sort by color. Limited pretend play.",
    ],
    concern: ["Very limited problem solving for age. No pretend play at 3 years."],
    red_flag: ["Significant cognitive regression. No functional play. No concept of counting."],
  },
  "37-48": {
    on_track: [
      "Counts to 10. Names some colors and numbers. Understands time concepts (morning, night). Draws with purpose.",
      "Plays board games with help. Compares sizes. Understands 'same' and 'different'. Follows 3-step directions.",
    ],
    monitor: [
      "Cannot count past 3. Difficulty with color naming. Limited understanding of time concepts.",
    ],
    concern: ["Very limited counting/color knowledge at 4 years. Difficulty following multi-step directions."],
    red_flag: ["Significant cognitive delays. Regression of learned skills."],
  },
  "49-60": {
    on_track: [
      "Counts to 20+. Knows address and phone number. Understands rhyming. Can tell what comes next in a story.",
      "Names 10+ colors. Draws pictures that represent things. Prints some letters. Understands 'first', 'last', 'middle'.",
    ],
    monitor: [
      "Counts to 5-10 only. Limited understanding of letters/numbers. Difficulty with sequences.",
    ],
    concern: ["Very limited academic readiness. Cannot count past 5. Does not recognize letters."],
    red_flag: ["Significant cognitive delay. Regression of skills. Cannot follow 2-step directions."],
  },
};

export const PERSONAL_SOCIAL_OBS: Record<AgeBand, DomainObservations> = {
  "0-3": {
    on_track: [
      "Social smile by 6 weeks. Enjoys playing with people. May cry when playing stops. Smiles spontaneously.",
      "Begins to develop social smile. Calms when spoken to or picked up. Looks at caregiver's face.",
    ],
    monitor: [
      "No social smile at 3 months. Limited eye contact. Does not seem to enjoy social interaction.",
    ],
    concern: ["No smiling. Does not calm when held. Avoids eye contact."],
    red_flag: ["No social smile by 3 months. No eye contact. No response to caregiver."],
  },
  "4-6": {
    on_track: [
      "Knows familiar people. Likes to look at self in mirror. Laughs. Responds to others' emotions.",
      "Enjoys social games like peek-a-boo. Shows happiness with squeals. Reaches for familiar people.",
    ],
    monitor: [
      "Limited social engagement. Does not seem to enjoy social games. Rare laughter.",
    ],
    concern: ["No response to social games. Does not show attachment to caregivers."],
    red_flag: ["No social responsiveness. No attachment behaviors. Avoids eye contact."],
  },
  "7-9": {
    on_track: [
      "Stranger anxiety present. Clings to familiar adults. Has favorite toys. Plays peek-a-boo.",
      "Shows anxiety with strangers. Understands 'no'. Explores with caregiver as base.",
    ],
    monitor: [
      "No stranger awareness. Limited attachment to caregivers. Does not play social games.",
    ],
    concern: ["No stranger anxiety at 9 months. No preferential attachment."],
    red_flag: ["No social engagement. No attachment to any adult. Avoids all social interaction."],
  },
  "10-12": {
    on_track: [
      "Shy or nervous with strangers. Cries when parent leaves. Has favorite things and people. Shows fear in some situations.",
      "Repeats actions that get attention. Puts out arm/leg to help with dressing. Plays simple pretend (feeding doll).",
    ],
    monitor: [
      "No separation anxiety. Goes to anyone equally. Limited social referencing.",
    ],
    concern: ["No attachment behaviors at 12 months. Does not show emotions."],
    red_flag: ["No social engagement at 12 months. No attachment. No shared enjoyment."],
  },
  "13-18": {
    on_track: [
      "Shows affection to familiar people. Plays simple pretend. May cling in new situations. Points to show things to others.",
      "Likes to hand things to others. Has temper tantrums. Explores alone with parent nearby.",
    ],
    monitor: [
      "Limited pretend play. Does not share interests by pointing. Difficulty with peer interaction.",
    ],
    concern: ["No pretend play at 18 months. No shared attention. Limited emotional range."],
    red_flag: ["No joint attention. No shared enjoyment. No pointing to show interest. Regression of social skills."],
  },
  "19-24": {
    on_track: [
      "Imitates others, especially adults. Gets excited around other children. Shows increasing independence.",
      "Plays mainly beside other children. Shows defiant behavior. Plays make-believe (feeds stuffed animal).",
    ],
    monitor: [
      "No interest in other children. Limited pretend play. Very dependent on caregiver.",
    ],
    concern: [
      "No joint attention at 24 months. Does not imitate. No pretend play.",
    ],
    red_flag: ["No social reciprocity. No imitation. Regression of social skills. Loss of shared attention."],
  },
  "25-36": {
    on_track: [
      "Shows affection for friends. Takes turns in games. Shows concern for crying friend. Understands 'mine' and 'yours'.",
      "Wide range of emotions. Separates easily from parents. Plays cooperatively with peers briefly.",
    ],
    monitor: [
      "Difficulty with turn-taking. Limited peer interaction. Does not show empathy.",
    ],
    concern: ["No cooperative play at 3 years. Does not show emotions appropriately."],
    red_flag: ["No peer interaction. Significant regression of social skills. No emotional expression."],
  },
  "37-48": {
    on_track: [
      "Cooperates with other children. Plays 'Mom' and 'Dad'. More creative with make-believe play. Negotiates with peers.",
      "Prefers friends. Can tell what is real and pretend. Talks about likes and interests.",
    ],
    monitor: [
      "Difficulty making friends. Limited cooperative play. Does not engage in pretend play with peers.",
    ],
    concern: ["No friends at 4 years. Cannot play cooperatively. Very limited social skills."],
    red_flag: ["No peer relationships. Significant social regression. Cannot express emotions."],
  },
  "49-60": {
    on_track: [
      "Wants to please friends. Follows rules in games. Likes to sing, dance, act. Shows concern and sympathy.",
      "Aware of gender. Tells difference between real and make-believe. Sometimes demanding, sometimes cooperative.",
    ],
    monitor: [
      "Difficulty following game rules. Limited empathy. Prefers solitary play exclusively.",
    ],
    concern: ["No friends. Cannot follow social rules. Very limited social understanding."],
    red_flag: ["Severe social isolation. Regression of social skills. No emotional reciprocity."],
  },
};

export const ICD10_BY_DOMAIN: Record<string, string[]> = {
  communication: ["F80.1", "F80.2", "F80.9", "R47.8", "R48.8"],
  gross_motor: ["F82.0", "R26.0", "R26.2", "G80.0", "F82.4"],
  fine_motor: ["F82.1", "F82.2", "R27.8", "R27.0"],
  problem_solving: ["F84.0", "F70", "F71", "F88", "R41.84"],
  personal_social: ["F84.0", "F93.0", "F94.1", "F94.2", "F84.5"],
  comprehensive: ["F89", "F88", "R62.0", "Z13.4"],
};

export const RECOMMENDATIONS_BY_RISK: Record<string, string[][]> = {
  on_track: [
    ["Continue age-appropriate developmental stimulation", "28d", "low", "A"],
    ["Schedule routine well-child visit per AAP schedule", "28d", "low", "A"],
    ["Provide language-rich environment with reading and singing", "28d", "low", "B"],
    ["Encourage floor play and physical activity", "28d", "low", "B"],
    ["Rescreen at next well-child visit", "28d", "low", "A"],
  ],
  monitor: [
    ["Rescreen in 4-6 weeks to monitor progress", "28d", "medium", "A"],
    ["Provide targeted developmental activities for flagged domains", "14d", "medium", "B"],
    ["Discuss findings with pediatrician at next visit", "14d", "medium", "A"],
    ["Consider early intervention referral if no improvement", "28d", "medium", "B"],
    ["Provide parent education materials on developmental milestones", "14d", "medium", "B"],
  ],
  concern: [
    ["Complete full ASQ-3 within 2 weeks", "14d", "high", "A"],
    ["Refer for developmental evaluation", "14d", "high", "A"],
    ["Speech therapy referral if communication domain affected", "7d", "high", "A"],
    ["Occupational therapy referral if motor domains affected", "14d", "high", "B"],
    ["Provide language-rich environment strategies", "7d", "high", "B"],
    ["Schedule follow-up screening in 4 weeks", "28d", "high", "A"],
  ],
  red_flag: [
    ["Immediate referral to developmental pediatrician", "immediate", "immediate", "A"],
    ["Audiology evaluation to rule out hearing loss", "7d", "immediate", "A"],
    ["Early intervention services referral (Part C/Part B)", "7d", "immediate", "A"],
    ["Complete comprehensive developmental evaluation", "7d", "immediate", "A"],
    ["Assess for autism spectrum disorder if social/communication flags", "7d", "immediate", "A"],
    ["Provide family support resources and counseling", "14d", "high", "B"],
  ],
};

export function getObservation(
  domain: string,
  ageBand: AgeBand,
  severity: "on_track" | "monitor" | "concern" | "red_flag",
  rng: () => number
): string {
  const obsMap: Record<string, Record<AgeBand, DomainObservations>> = {
    communication: COMMUNICATION_OBS,
    gross_motor: GROSS_MOTOR_OBS,
    fine_motor: FINE_MOTOR_OBS,
    problem_solving: PROBLEM_SOLVING_OBS,
    personal_social: PERSONAL_SOCIAL_OBS,
  };
  const domainObs = obsMap[domain] || obsMap["communication"];
  const entries = domainObs[ageBand]?.[severity] || domainObs["19-24"][severity];
  return entries[Math.floor(rng() * entries.length)];
}
