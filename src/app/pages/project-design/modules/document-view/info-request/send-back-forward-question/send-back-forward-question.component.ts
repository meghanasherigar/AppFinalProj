import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { TaskService } from '../../services/task.service';
import { SendEmailService } from '../../../../../../shared/services/send-email.service';
import { ForwardEmailViewModel, QuestionIdsViewModel, QuestionsUserViewModel, SendBackForwardQuestionsViewModel } from '../../../../../../@models/userAdmin';
import { SelectedQuestionsViewModel, selectedQuestionsViewModel } from '../../../../../../@models/projectDesigner/task';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-send-back-forward-question',
  templateUrl: './send-back-forward-question.component.html',
  styleUrls: ['./send-back-forward-question.component.scss']
})
export class SendBackForwardQuestionComponent implements OnInit {
  SendBackForReviewForm: FormGroup;
  projectDetails: any;
  questionsUser:QuestionsUserViewModel[]=[];
  selectedQuestionsViewModel:SelectedQuestionsViewModel[]=[];
  section: QuestionsUserViewModel[] = [];
  users:any;
  submitted: boolean;
    constructor( 
    protected ref: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private sharedService: ShareDetailService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private taskService: TaskService,
    private sendEmailService:SendEmailService,
    protected designerService: DesignerService,
    private dialogServiceShared: DialogService,
    private translate: TranslateService, 
    ) {

    this.SendBackForReviewForm = this.formBuilder.group({
      Users: ['', Validators.required],
      Question:[''],
      DDUser: {}
    });
  } 

  ngOnInit() {
    this.questionsUser=(this.section);
    
    // this.projectDetails = this.sharedService.getORganizationDetail();
    // let mdl=new ForwardEmailViewModel();
    // mdl.InformationRequestId=this.designerService.infoRequestId;
    // mdl.QuestionsId=this.section;
    // this.sendEmailService.getusersforforwardquestions(mdl).subscribe(
    //   data => {
    //     if(data.length==0){
    //       if(this.designerService.selectedQuestionTitle[0].isForwarded===true)
    //       {

    //       }   //forward to assignee
    //     }
    //     data.forEach(item=>{ 
    //       let mdl=new QuestionsUserViewModel();
    //       mdl.QuestionId=item["questionId"];
    //       mdl.Users=item["users"];
    //       let title=this.designerService.selectedQuestionTitle.filter(x=>x.questionId===mdl.QuestionId["questionId"]);
    //       mdl.Title=title[0].title;
    //       this.questionsUser.push(mdl);
    //     });       
    //   });
  }
  get form() { return this.SendBackForReviewForm.controls; }
  sendBackForwardQuestion()
  {
    this.submitted = true;
    if (this.SendBackForReviewForm.invalid) {
      return;
    }
      let data = this.SendBackForReviewForm.value;
      let mdl=new SendBackForwardQuestionsViewModel();
      mdl.InformationRequestId=this.designerService.infoRequestId;
      this.questionsUser.forEach((questionTmp,index)=>{
        questionTmp.Users=[];
        if(data.DDUser.length>0)
          questionTmp.Users.push(data.DDUser[index]);
        else
          questionTmp.Users.push(data.DDUser);
      });
      mdl.Questions=this.questionsUser;
      this.sendEmailService.sendbackforreviewforforwardquestion(mdl).subscribe((result: any) => {
        if (result.status === ResponseStatus.Sucess) 
        this.toastr.success(this.translate.instant('screens.project-user.sendBackForReviewSuccessMessage'));
           
        else 
          this.dialogServiceShared.Open(DialogTypes.Warning, result.errorMessages[0]);
          this.dismiss();
        },
        error => {
          this.dialogServiceShared.Open(DialogTypes.Warning, error.message);
        });
  }    
  userSelect(event)
  {
    if (event.target.selectedIndex == 0)
      this.SendBackForReviewForm.controls.Users.setValue('');
    else 
      this.SendBackForReviewForm.controls.Users.setValue(event.target.value);
  }  
  dismiss(){
    this.ref.close();
  }

}
