import { BaseFilterViewModel } from '../common/commonmodel';

export class ProjectVariableFilterViewModel extends BaseFilterViewModel {
    ProjectId: string;
    ProjectVariableIds: string[] = [];
}

export class ProjectVariableResponseViewModel {
    projectVariableList: ProjectVariableResultViewModel[];
    totalProjectVariableCount: number;
}

export class ProjectVariableResultViewModel {
    id: string;
    variable: string;
    value: string;
}

export class ProjectVariableInsertViewModel {
    ProjectId: string;
    Variable: string;
    Value: string;
}

export class ProjectVariableUpdateViewModel {
    Id: string;
    ProjectId: string;
    Variable: string;
    Value: string;
}

export class ProjectVariableDeleteViewModel {
    ProjectId: string;
    ProjectVariableIds: string[];
}

export class EntityVariableFilterViewModel extends BaseFilterViewModel {
    ProjectId: string;
    EntityIds: string[] = [];
    CountryIds: string[] = [];
    EntityShortNames: string[] = [];
    TaxableYearStart: Date = null;
    TaxableYearEnd: Date = null;
}

export class EntityVariableResponseViewModel {
    entityVariableList: EntityVariableResultViewModel[];
    totalEntityVariableCount: number;
}

export class EntityVariableResultViewModel {
    id: string
    legalEntityName: string
    countryId: string
    countryName: string
    entityShortName: string
    taxableYearEnd: string
}

export class ProjectVariableFilterMenuViewModel {
    variables: FilterViewModel[];
    values: FilterViewModel[];
}

export class EntityVariableFilterMenuViewModel {
    legalEntityNames: FilterViewModel[];
    entityShortNames: FilterViewModel[];
    countryNames: FilterViewModel[];
    taxableYearEndFrom: Date;
    taxableYearEndTo: Date;
}

export class FilterViewModel {
    id: string;
    name: string;
}

export class EntityFilterViewModel extends BaseFilterViewModel {
    ProjectId: string
    EntityIds: string[];
    CountryIds: string[];
    EntityShortNames: string[];
    TaxableYearStart: Date
    TaxableYearEnd: Date
    BlockTypeId: string
}

export class AnswerTagsResponseViewModel {
    answerTagList: AnswerTagsResultViewModel[];
    tag: string[];
    totalCount: number;
}

export class EntityResultViewModel {
    entityId: string;
    legalEntityName: string;
    taxableYearEnd: Date;
    country: string;
}

export class AnswerTagsResultViewModel extends EntityResultViewModel {
    answer: string[];
    type: QuestionTypeViewModel[];
    questionnariesId: string[];
    questionId: string[];
}

export class QuestionTypeViewModel {
    id: string;
    typeName: string;
}

export class BlockType {
    blockTypeId: string;
    blockType: string;
    Id: string;
}

export class ProjectVariableDownloadViewModel {
    ProjectId: string;
    ProjectVariableIds: string[];
}

export class EntityVariableDownloadViewModel {
    ProjectId: string;
    EntityIds: string[];
    CountryIds: string[];
    EntityShortNames: string[];
    TaxableYearStart: Date;
    TaxableYearEnd: Date;
}

export class AnswerTagIcons {
    enableCreate: boolean = false;
    enableDelete: boolean = false;
}
export class AnswerSaveDocView {
    projectId: string;
    templateOrDeliverableId: string;
    isTemplate: boolean;
    blockDetails: BlockDetail[] = [];
}
export class BlockDetail {
    blockId: string;
    HashTags: HashTagDomainModel[] = [];
}
export class HashTagDomainModel {
    hashTagQuestion: string;
    hashTagAnswer: string;
} 