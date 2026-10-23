import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,overall,changeStatus,safeUrl,validState} from './model.js';
test('progresso calculado, incluindo lista vazia e conclusão',()=>{assert.equal(overall(seed.stages),43);assert.equal(overall([]),0);assert.equal(overall(seed.stages.map(s=>changeStatus(s,'done'))),100);});
test('mudanças de status preservam percentuais coerentes',()=>{const s=seed.stages[0];assert.equal(changeStatus(s,'pending').progress,0);assert.equal(changeStatus(s,'active').progress,99);assert.equal(changeStatus(s,'done').progress,100);});
test('importação valida estrutura e rejeita links executáveis e percentuais inválidos',()=>{assert.ok(validState(seed));assert.ok(!validState({...seed,stages:[{...seed.stages[0],progress:-1}]}));assert.ok(!validState({...seed,documents:[{id:'x',title:'x',url:'javascript:alert(1)'}]}));assert.ok(!validState({...seed,updates:[{id:'x'}]}));assert.ok(!safeUrl('data:text/html,x'));assert.equal(safeUrl('https://example.com'),'https://example.com/');});
