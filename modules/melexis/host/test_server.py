import unittest
from server import Mock,dispatch,bytes_result
class Tests(unittest.TestCase):
 def test_read(self):
  m=Mock(); self.assertEqual(dispatch(m,'info',{'model':'mlx90328'})['mode'],'simulation')
  self.assertEqual(dispatch(m,'sample',{'model':'mlx90328','count':12})['samples'],12)
  self.assertEqual(dispatch(m,'eeprom',{'model':'mlx90328'})['bytes'],dispatch(m,'eeprom',{'model':'mlx90328'})['bytes'])
 def test_reject(self):
  for op,data in [('write',{'model':'mlx90328'}),('sample',{'model':'mlx90328','count':0}),('info',{'model':'other'})]:
   with self.assertRaises(ValueError):dispatch(Mock(),op,data)
  with self.assertRaises(ValueError):bytes_result([256])

class IdentityTests(unittest.TestCase):
 def test_changed_sensor(self):
  class Changing(Mock):
   def sample(self,model):
    r=super().sample(model);r['identity']=str(self.i);return r
  with self.assertRaises(ValueError):dispatch(Changing(),'sample',{'model':'mlx90328','count':2})
 def test_info_identity(self):
  m=Mock(); self.assertEqual(dispatch(m,'info',{'model':'mlx90329'})['identity'],'SIMULATION-mlx90329')

if __name__=='__main__':unittest.main()
