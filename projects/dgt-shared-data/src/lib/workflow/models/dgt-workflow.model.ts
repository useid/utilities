import { DGTWorkflowAction } from './dgt-workflow-action.model';
import { DGTLDPredicate } from '../../linked-data/models/dgt-ld-predicate.model';

export interface DGTWorkflow {
    actions: DGTWorkflowAction[];
    fields: DGTLDPredicate[];
    source: string;
}
