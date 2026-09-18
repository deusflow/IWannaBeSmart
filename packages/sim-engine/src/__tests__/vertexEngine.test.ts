/**
 * @file packages/sim-engine/src/__tests__/vertexEngine.test.ts
 * @description Comprehensive unit tests for Station 06: Vertex AI Architect engine & tasks
 */

import { describe, it, expect } from "vitest";
import {
  INITIAL_VERTEX_STATE,
  connectGcsBucket,
  setPreprocessingStep,
  runTraining,
  configureEndpoint,
  configureIam,
  checkMonitoring,
} from "../runtime/vertexContext";
import { VERTEX_TASKS } from "../runtime/tasks-vertex";

describe("Vertex AI Architect Engine (Station 06)", () => {
  describe("Context Operations", () => {
    it("should reject invalid GCS URI and accept valid gs:// URI", () => {
      const invalid = connectGcsBucket(INITIAL_VERTEX_STATE, "http://bucket.com");
      expect(invalid.success).toBe(false);
      expect(invalid.output).toContain("Must start with gs://");

      const valid = connectGcsBucket(INITIAL_VERTEX_STATE, "gs://training-data");
      expect(valid.success).toBe(true);
      expect(valid.newState.gcsBucket).toBe("gs://training-data");
      expect(valid.newState.pipelineStatus).toBe("ingesting");
    });

    it("should set preprocessing steps and calculate cost", () => {
      const stateWithBucket = { ...INITIAL_VERTEX_STATE, gcsBucket: "gs://valid-bucket" };
      const res = setPreprocessingStep(stateWithBucket, "both");
      expect(res.success).toBe(true);
      expect(res.newState.preprocessingStep).toBe("both");
      expect(res.newState.pipelineStatus).toBe("preprocessing");
    });

    it("should execute training, scale accuracy with hardware, and record metrics", () => {
      const stateWithData = {
        ...INITIAL_VERTEX_STATE,
        gcsBucket: "gs://prod-data",
        preprocessingStep: "normalize" as const,
      };

      const trainResult = runTraining(stateWithData, "a2-highgpu-1g", 64, 0.0001);
      expect(trainResult.success).toBe(true);
      expect(trainResult.newState.pipelineStatus).toBe("evaluating");
      expect(trainResult.newState.accuracy).toBeGreaterThan(0.7);
      expect(trainResult.newState.hardwareType).toBe("a2-highgpu-1g");
      expect(trainResult.newState.modelVersion).toBe(1);
    });

    it("should fail training if dataset is not connected", () => {
      const trainResult = runTraining(INITIAL_VERTEX_STATE, "n1-standard-4", 32, 0.001);
      expect(trainResult.success).toBe(false);
      expect(trainResult.output).toContain("No data source connected");
    });

    it("should configure serving endpoint with autoscaling and traffic split", () => {
      const stateWithModel = {
        ...INITIAL_VERTEX_STATE,
        modelVersion: 1,
        accuracy: 0.92,
      };

      const endpointResult = configureEndpoint(stateWithModel, {
        minReplicas: 2,
        maxReplicas: 8,
        trafficSplitPercent: 100,
        autoscalingEnabled: true,
      });

      expect(endpointResult.success).toBe(true);
      expect(endpointResult.newState.endpointConfig.minReplicas).toBe(2);
      expect(endpointResult.newState.endpointConfig.maxReplicas).toBe(8);
      expect(endpointResult.newState.endpointConfig.trafficSplitPercent).toBe(100);
      expect(endpointResult.newState.pipelineStatus).toBe("serving");
    });

    it("should reject endpoint deployment if minReplicas > maxReplicas", () => {
      const stateWithModel = {
        ...INITIAL_VERTEX_STATE,
        modelVersion: 1,
      };
      const res = configureEndpoint(stateWithModel, {
        minReplicas: 5,
        maxReplicas: 2,
        trafficSplitPercent: 50,
        autoscalingEnabled: true,
      });
      expect(res.success).toBe(false);
      expect(res.output).toContain("minReplicas");
    });

    it("should enforce least privilege and block dangerous IAM roles", () => {
      const res = configureIam(
        INITIAL_VERTEX_STATE,
        {
          vpcPeeringEnabled: true,
          serviceAccountEmail: "sa-ml@proj.iam.gserviceaccount.com",
          deniedRoles: ["roles/owner", "roles/editor"],
          dataResidencyRegion: "eu-west1",
        },
        "service-account"
      );

      expect(res.success).toBe(true);
      expect(res.newState.iamConfig.vpcPeeringEnabled).toBe(true);
      expect(res.newState.iamConfig.dataResidencyRegion).toBe("eu-west1");
      expect(res.newState.authPolicy).toBe("service-account");
    });

    it("should trigger drift alert when drift exceeds configured threshold", () => {
      const state = {
        ...INITIAL_VERTEX_STATE,
        pipelineStatus: "serving" as const,
        modelVersion: 1,
      };

      const monConfig = {
        driftThreshold: 0.10,
        latencySloMs: 200,
        alertEmail: "ops@company.com",
        retrainingTriggerEnabled: true,
      };

      const monRes = checkMonitoring(state, monConfig);
      expect(monRes.success).toBe(true);
      expect(monRes.newState.alerts.length).toBeGreaterThan(0);
      expect(monRes.logs.some((l) => l.includes("ALERT"))).toBe(true);
    });
  });

  describe("Curriculum Tasks Validation (15 Tasks)", () => {
    it("should have 15 structured tasks across 5 rounds", () => {
      expect(VERTEX_TASKS.length).toBe(15);
      const rounds = new Set(VERTEX_TASKS.map((t) => t.round));
      expect(rounds.size).toBe(5);
    });

    it("task-vertex-1: should validate GCS connection", () => {
      const task = VERTEX_TASKS[0];
      const before = INITIAL_VERTEX_STATE;
      const validResult = connectGcsBucket(before, "gs://retail-training-data");
      const validation = task.validate(before, validResult.newState, validResult);
      expect(validation.passed).toBe(true);
    });

    it("task-vertex-4: should validate accelerator selection", () => {
      const task = VERTEX_TASKS[3];
      const before = {
        ...INITIAL_VERTEX_STATE,
        gcsBucket: "gs://valid",
        preprocessingStep: "normalize" as const,
      };
      const validResult = runTraining(before, "a2-highgpu-1g", 32, 0.001);
      const validation = task.validate(before, validResult.newState, validResult);
      expect(validation.passed).toBe(true);
    });

    it("task-vertex-8: should validate autoscaling configuration", () => {
      const task = VERTEX_TASKS[7];
      const before = {
        ...INITIAL_VERTEX_STATE,
        modelVersion: 1,
      };
      const validResult = configureEndpoint(before, {
        minReplicas: 2,
        maxReplicas: 10,
        trafficSplitPercent: 100,
        autoscalingEnabled: true,
      });
      const validation = task.validate(before, validResult.newState, validResult);
      expect(validation.passed).toBe(true);
    });

    it("task-vertex-11: should validate VPC peering", () => {
      const task = VERTEX_TASKS[10];
      const before = INITIAL_VERTEX_STATE;
      const validResult = configureIam(
        before,
        {
          vpcPeeringEnabled: true,
          serviceAccountEmail: "sa@proj.iam.gserviceaccount.com",
          deniedRoles: ["roles/owner"],
          dataResidencyRegion: "eu-west1",
        },
        "service-account"
      );
      const validation = task.validate(before, validResult.newState, validResult);
      expect(validation.passed).toBe(true);
    });
  });
});
