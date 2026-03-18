import React from 'react';

// Normal icons (for category cards - 28px)
import AbstractNormal from '../assets/category-icons/normal/abstract.svg';
import ActionsDailyActivitiesNormal from '../assets/category-icons/normal/actions-and-daily-activities.svg';
import ArtEntertainmentNormal from '../assets/category-icons/normal/art-and-entertainment.svg';
import BodyHealthNormal from '../assets/category-icons/normal/body-and-health.svg';
import ClothingFashionNormal from '../assets/category-icons/normal/clothing-and-fashion.svg';
import CommunicationLanguageNormal from '../assets/category-icons/normal/communication-and-language.svg';
import ConnectorsGrammarWordsNormal from '../assets/category-icons/normal/connectors-and-grammar-words.svg';
import CultureSocietyNormal from '../assets/category-icons/normal/culture-and-society.svg';
import DescriptionQualitiesNormal from '../assets/category-icons/normal/description-and-qualities.svg';
import DirectionPositionNormal from '../assets/category-icons/normal/direction-and-position.svg';
import EducationLearningNormal from '../assets/category-icons/normal/education-and-learning.svg';
import EmotionsFeelingsNormal from '../assets/category-icons/normal/emotions-and-feelings.svg';
import FoodDrinksNormal from '../assets/category-icons/normal/food-and-drinks.svg';
import HomeHouseholdNormal from '../assets/category-icons/normal/home-and-household.svg';
import LawGovernmentNormal from '../assets/category-icons/normal/law-and-government.svg';
import NatureEnvironmentNormal from '../assets/category-icons/normal/nature-and-environment.svg';
import NumbersQuantitiesNormal from '../assets/category-icons/normal/numbers-and-quantities.svg';
import PeopleRelationshipsNormal from '../assets/category-icons/normal/people-and-relationships.svg';
import PersonalityCharacterNormal from '../assets/category-icons/normal/personality-and-character.svg';
import PlacesLocationsNormal from '../assets/category-icons/normal/places-and-locations.svg';
import ReligionSpiritualityNormal from '../assets/category-icons/normal/religion-and-spirituality.svg';
import ScienceNormal from '../assets/category-icons/normal/science.svg';
import ShoppingMoneyNormal from '../assets/category-icons/normal/shopping-and-money.svg';
import SlangInformalLanguageNormal from '../assets/category-icons/normal/slang-and-informal-language.svg';
import SportGamesNormal from '../assets/category-icons/normal/sport-and-games.svg';
import TechnologyNormal from '../assets/category-icons/normal/technology.svg';
import TimeCalendarNormal from '../assets/category-icons/normal/time-and-calendar.svg';
import TransportationNormal from '../assets/category-icons/normal/transportation.svg';
import TravelTourismNormal from '../assets/category-icons/normal/travel-and-tourism.svg';
import WorkBusinessNormal from '../assets/category-icons/normal/work-and-business.svg';

// Emphasized icons (for page headers - 32px)
import AbstractEmphasized from '../assets/category-icons/emphasized/abstract.svg';
import ActionsDailyActivitiesEmphasized from '../assets/category-icons/emphasized/actions-and-daily-activities.svg';
import ArtEntertainmentEmphasized from '../assets/category-icons/emphasized/art-and-entertainment.svg';
import BodyHealthEmphasized from '../assets/category-icons/emphasized/body-and-health.svg';
import ClothingFashionEmphasized from '../assets/category-icons/emphasized/clothing-and-fashion.svg';
import CommunicationLanguageEmphasized from '../assets/category-icons/emphasized/communication-and-language.svg';
import ConnectorsGrammarWordsEmphasized from '../assets/category-icons/emphasized/connectors-and-grammar-words.svg';
import CultureSocietyEmphasized from '../assets/category-icons/emphasized/culture-and-society.svg';
import DescriptionQualitiesEmphasized from '../assets/category-icons/emphasized/description-and-qualities.svg';
import DirectionPositionEmphasized from '../assets/category-icons/emphasized/direction-and-position.svg';
import EducationLearningEmphasized from '../assets/category-icons/emphasized/education-and-learning.svg';
import EmotionsFeelingsEmphasized from '../assets/category-icons/emphasized/emotions-and-feelings.svg';
import FoodDrinksEmphasized from '../assets/category-icons/emphasized/food-and-drinks.svg';
import HomeHouseholdEmphasized from '../assets/category-icons/emphasized/home-and-household.svg';
import LawGovernmentEmphasized from '../assets/category-icons/emphasized/law-and-government.svg';
import NatureEnvironmentEmphasized from '../assets/category-icons/emphasized/nature-and-environment.svg';
import NumbersQuantitiesEmphasized from '../assets/category-icons/emphasized/numbers-and-quantities.svg';
import PeopleRelationshipsEmphasized from '../assets/category-icons/emphasized/people-and-relationships.svg';
import PersonalityCharacterEmphasized from '../assets/category-icons/emphasized/personality-and-character.svg';
import PlacesLocationsEmphasized from '../assets/category-icons/emphasized/places-and-locations.svg';
import ReligionSpiritualityEmphasized from '../assets/category-icons/emphasized/religion-and-spirituality.svg';
import ScienceEmphasized from '../assets/category-icons/emphasized/science.svg';
import ShoppingMoneyEmphasized from '../assets/category-icons/emphasized/shopping-and-money.svg';
import SlangInformalLanguageEmphasized from '../assets/category-icons/emphasized/slang-and-informal-language.svg';
import SportGamesEmphasized from '../assets/category-icons/emphasized/sport-and-games.svg';
import TechnologyEmphasized from '../assets/category-icons/emphasized/technology.svg';
import TimeCalendarEmphasized from '../assets/category-icons/emphasized/time-and-calendar.svg';
import TransportationEmphasized from '../assets/category-icons/emphasized/transportation.svg';
import TravelTourismEmphasized from '../assets/category-icons/emphasized/travel-and-tourism.svg';
import WorkBusinessEmphasized from '../assets/category-icons/emphasized/work-and-business.svg';

type SvgComponent = React.FC<{ width?: number; height?: number; color?: string }>;

type IconEntry = {
  normal: SvgComponent;
  emphasized: SvgComponent;
};

// Map from category name (as stored in DB) to icon components.
// Keys are normalized: lowercase, trimmed.
const iconMap: Record<string, IconEntry> = {
  'abstract concepts': { normal: AbstractNormal, emphasized: AbstractEmphasized },
  'actions & daily activities': { normal: ActionsDailyActivitiesNormal, emphasized: ActionsDailyActivitiesEmphasized },
  'arts & entertainment': { normal: ArtEntertainmentNormal, emphasized: ArtEntertainmentEmphasized },
  'body & health': { normal: BodyHealthNormal, emphasized: BodyHealthEmphasized },
  'clothing & fashion': { normal: ClothingFashionNormal, emphasized: ClothingFashionEmphasized },
  'communication & language': { normal: CommunicationLanguageNormal, emphasized: CommunicationLanguageEmphasized },
  'connectors & grammar words': { normal: ConnectorsGrammarWordsNormal, emphasized: ConnectorsGrammarWordsEmphasized },
  'culture & society': { normal: CultureSocietyNormal, emphasized: CultureSocietyEmphasized },
  'descriptions & qualities': { normal: DescriptionQualitiesNormal, emphasized: DescriptionQualitiesEmphasized },
  'direction & position': { normal: DirectionPositionNormal, emphasized: DirectionPositionEmphasized },
  'education & learning': { normal: EducationLearningNormal, emphasized: EducationLearningEmphasized },
  'emotions & feelings': { normal: EmotionsFeelingsNormal, emphasized: EmotionsFeelingsEmphasized },
  'food & drink': { normal: FoodDrinksNormal, emphasized: FoodDrinksEmphasized },
  'home & household': { normal: HomeHouseholdNormal, emphasized: HomeHouseholdEmphasized },
  'law & government': { normal: LawGovernmentNormal, emphasized: LawGovernmentEmphasized },
  'nature & environment': { normal: NatureEnvironmentNormal, emphasized: NatureEnvironmentEmphasized },
  'numbers & quantities': { normal: NumbersQuantitiesNormal, emphasized: NumbersQuantitiesEmphasized },
  'people & relationships': { normal: PeopleRelationshipsNormal, emphasized: PeopleRelationshipsEmphasized },
  'personality & character': { normal: PersonalityCharacterNormal, emphasized: PersonalityCharacterEmphasized },
  'places & locations': { normal: PlacesLocationsNormal, emphasized: PlacesLocationsEmphasized },
  'religion & spirituality': { normal: ReligionSpiritualityNormal, emphasized: ReligionSpiritualityEmphasized },
  'science': { normal: ScienceNormal, emphasized: ScienceEmphasized },
  'shopping & money': { normal: ShoppingMoneyNormal, emphasized: ShoppingMoneyEmphasized },
  'slang & informal language': { normal: SlangInformalLanguageNormal, emphasized: SlangInformalLanguageEmphasized },
  'sports & games': { normal: SportGamesNormal, emphasized: SportGamesEmphasized },
  'technology': { normal: TechnologyNormal, emphasized: TechnologyEmphasized },
  'time & calendar': { normal: TimeCalendarNormal, emphasized: TimeCalendarEmphasized },
  'transportation': { normal: TransportationNormal, emphasized: TransportationEmphasized },
  'travel & tourism': { normal: TravelTourismNormal, emphasized: TravelTourismEmphasized },
  'work & business': { normal: WorkBusinessNormal, emphasized: WorkBusinessEmphasized },
};

/**
 * Get the icon component for a category by name.
 * Returns null if no icon is found for the given category.
 */
export function getCategoryIcon(
  categoryName: string,
  variant: 'normal' | 'emphasized'
): SvgComponent | null {
  const key = categoryName.toLowerCase().trim();
  const entry = iconMap[key];
  return entry ? entry[variant] : null;
}
