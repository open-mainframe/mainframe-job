import { JobEntrySubsystem } from "../index";

const connectionOptions = {
    host: "localhost",
    password: "test",
    user: "test",
};

const jobEntrySubsystem = new JobEntrySubsystem(connectionOptions);

const JCLTestJob = `
//${connectionOptions.user}TSS  JOB 5,'${connectionOptions.user}',CLASS=P,MSGCLASS=X,
//            NOTIFY=${connectionOptions.user},MSGLEVEL=(,0)
//**
//**
//**
//**
//********************************************************************
//TSSTMP   EXEC PGM=IKJEFT01,REGION=300K,
//            PARM='TSS LIS(${connectionOptions.user}) DATA(ALL)'
//SYSPRINT DD SYSOUT=*
//SYSTSPRT DD SYSOUT=*
//SYSTSIN  DD DUMMY
//
`;

const JCLBuffer = Buffer.from(JCLTestJob.replace(/\r?\n/g, "\r\n"), "ascii");

jobEntrySubsystem.submitJob(JCLBuffer, "tsslist.jcl")
    .then( (buffer) => {
        console.log(buffer.toString("ascii"));
    } );
