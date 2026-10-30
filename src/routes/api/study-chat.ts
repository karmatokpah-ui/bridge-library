import {createFileRoute} from '@tanstack/react-router';
import {handleStudyChat} from '@/lib/study-chat.server';
export const Route=createFileRoute('/api/study-chat')({server:{handlers:{POST:({request})=>handleStudyChat(request)}}});