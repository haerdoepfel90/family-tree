from pydantic import BaseModel


class Individual(BaseModel):
    given_name: str | None = None
    second_name: str | None = None
    third_name: str | None = None
    surname: str | None = None
    maiden_name: str | None = None
    sex: str | None = None
    birth_date: str | None = None
    birth_place: str | None = None
    death_date: str | None = None
    death_place: str | None = None


class IndividualPatch(Individual):
    given_name: str | None = None
    second_name: str | None = None
    third_name: str | None = None
    surname: str | None = None
    maiden_name: str | None = None
    sex: str | None = None
    birth_date: str | None = None
    birth_place: str | None = None
    death_date: str | None = None
    death_place: str | None = None


class Family(BaseModel):
    partner_1: int
    partner_2: int
    wedding_date: str | None = None


class FamilyPatch(BaseModel):
    partner_1: int | None = None
    partner_2: int | None = None
    wedding_date: str | None = None
    children_list: list[int] | None = None
