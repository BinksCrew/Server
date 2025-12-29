import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description: 'The ID of the question being answered',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: "The user's answer to the question",
    example: 'Sasuke Uchiha',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
