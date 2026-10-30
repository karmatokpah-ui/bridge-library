import {it,expect} from 'vitest';
import {publishedPracticeQuestions} from './practice-content';
it('never substitutes built-in questions for an empty published bank',()=>expect(publishedPracticeQuestions([])).toEqual([]));
it('rejects demonstration IDs instead of using them in saved tests',()=>expect(publishedPracticeQuestions([{id:'demo-math-1',prompt:'test',options:[{id:'A',text:'a'},{id:'B',text:'b'}],explanation:null,exam_type:'demo'}])).toEqual([]));
it('uses valid database question IDs and strips client answer keys',()=>{
 const q=publishedPracticeQuestions([{id:'10000000-0000-4000-8000-000000000001',prompt:'Published question',options:[{id:'A',text:'a'},{id:'B',text:'b'}],explanation:null,exam_type:'School exam',correct_option:'A'}]);
 expect(q).toHaveLength(1);expect(q[0]).not.toHaveProperty('correct_option');
});