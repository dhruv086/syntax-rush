from src.logger import logging
from src.exception import CustomException
import sys


class Assessment:
    """Handles initial 4 questions for users."""

    def __init__(self):

        self.assessment_questions=[
            {
                'questionID':101,
                'question':"Basic Array",
                'topic':'arrays',
                'difficulty':'easy/bronze',
                'correct_answer':'O(n)'
            },
            {
                'questionID':101,
                'question':'Stack and Queue',
                'topic':'stack and queue',
                'difficulty': 'medium/gold',
                'correct_answer':'O(n)'
            },
            {
                'questionID':101,
                'question':'Trees',
                'topic':'trees',
                'difficulty': 'hard/platinum',
                'correct_answer':'O(n)
            },
            {
                'questionID':101,
                'question':'dp/backtracking',
                'topic':'dp/backtracking',
                'difficulty': 'hard/master',
                'correct_answer':'O(n)
            }
        ]

    def get_assessment_questions(self):
        """returns 4 assessment questions for user."""
        
        try:
            logging,info("Getting assessment questions")
            return self.assessment_questions
        except Exception as e:
            logging.error("Failed to get assessment questions.")
            raise CustomException(e,sys)

    def evaluate_assessment(self,user_answers):
        """ evaluate user's answer ans assign league according to scores."""

        try:
            logging.info("Evaluating assessment answers")

            # correct answers
            correct_answer=[q['correct_answer'] for q in self.assessment_questions]

            score = 0
            for user_ans,correct_ans in zip(user_answers,correct_answer):
                if user_ans == correct_answer:
                    score +=1

            league = self.assign_league_from_score.get(score,'deafult')

            result = {
                'score':score,
                'total_questions':len(self.assessment_questions),
                'assigned_league':league,
                'performance_percentage':(score/len(self.assessment_questions)) * 100
            }

            logging.info(f"Assignment complete: {score}/4 correct, assigned to {league} league.")

            return result

        except Exception as e:
            logging.error("Failed to evaluate assessment")
            raise CustomException(e,sys)

    def assign_league_from_score(self,score):
        "Assign league based on assessment score."

        try:
            league_by_score = {
                1:'bronze',
                2:'gold',
                3:'platinum',
                4:'diamond',
            }

        except Exception as e:
            logging.error("Failed to assign league")
            return 'default'


    def get_league_welcome_message(self,league):
        """Get welcome message for assisgned league"""

        messages={
            'bronze': "Welcome to Bronze League! Start with arrays and strings.",
            'gold': "Welcome to Gold League! Master stacks and queues.", 
            'platinum': "Welcome to Platinum League! Dive into tree algorithms.",
            'diamond':'welcome to diamond league.',
        }

        return messages.get(league,'Welcome to the coding arena.')
