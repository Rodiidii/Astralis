import unittest
import json
from tempfile import TemporaryDirectory
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('build_relations', Path(__file__).parents[1] / 'tools/build-relations.py')
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)


class RelationsTitles(unittest.TestCase):
    def test_title_names_are_exact_and_ambiguity_is_rejected(self):
        aliases = pipeline.aliases_for([{'name':'Jean','id':1},{'name':'Émilie','id':2},{'name':'Tartaglia','id':3}])
        self.assertEqual(pipeline.target_for('À propos de Jean - Souci', aliases), '1')
        self.assertEqual(pipeline.target_for("À propos d'Émilie…", aliases), '2')
        self.assertEqual(pipeline.target_for('About Childe: In Liyue', aliases), '3')
        for title in ('À propos de Jean-Pierre...', 'À propos des Jeannes', 'Combat avec Jean', 'À propos de nous'):
            self.assertIsNone(pipeline.target_for(title, aliases))

    def test_scene_uses_two_named_speakers_and_preserves_both_citations(self):
        def line(name, quote, category='SpeakerKnown'):
            return {'speakerText':{'textId':name,'textType':category},
                    'dialogs':[{'text':{'textId':quote}}]}
        scene = {'subQuestTitle':{'textId':'Scène de test'},'items':[
            line('Jean','Réplique A'), line('Amber','Réplique B'), line('Lisa','Réplique C','Unknown')]}
        quest = {'mainQuestId':7,'subQuests':[scene]}
        with TemporaryDirectory() as directory:
            path=Path(directory)/'quests.jsonl'
            path.write_text(json.dumps(quest)+'\n',encoding='utf-8')
            result=list(pipeline.quest_evidence(path,'fr','https://example.org/corpus',
                                              {'jean':'1','amber':'2','lisa':'3'}))
        self.assertEqual(len(result),1)
        self.assertEqual((result[0]['quote'],result[0]['reply']),('Réplique A','Réplique B'))
        self.assertEqual(result[0]['quest'],'7')


if __name__ == '__main__':
    unittest.main()
