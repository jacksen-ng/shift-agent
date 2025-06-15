import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crew_info_edit_entity import CrewInfoEditEntity
from crew_info_entity import CrewInfoEntity

crew_info_entities = {
    "CrewInfoEditEntity": CrewInfoEditEntity,
    "CrewInfoEntity": CrewInfoEntity
}