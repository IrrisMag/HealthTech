
import os
import logging
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

import numpy as np
import pandas as pd
from scipy.optimize import linprog, minimize
from pulp import LpMaximize, LpMinimize, LpProblem, LpVariable, lpSum, LpStatus, value
import aiohttp
from fastapi import FastAPI, HTTPException, Depends, Query, Body, BackgroundTasks
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

try:
    from database import get_database, connect_to_mongo, close_mongo_connection
except ImportError:
    from mock_database import get_mock_database as get_database
    async def connect_to_mongo(): pass
    async def close_mongo_connection(): pass

try:
    from auth_deps import get_current_user
except ImportError:
    async def get_current_user() -> dict:
        return {"user_id": "test_user", "username": "test"}

from models import BloodType, DonationType, Priority

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
FORECASTING_SERVICE_URL = os.getenv("FORECASTING_SERVICE_URL", "http://localhost:8000/forecast")
INGESTION_SERVICE_URL = os.getenv("INGESTION_SERVICE_URL", "http://localhost:8000/data")
OPTIMIZATION_MODEL = os.getenv("OPTIMIZATION_MODEL", "linear_programming")

class OptimizationMethod(str, Enum):
    LINEAR_PROGRAMMING = "linear_programming"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    HYBRID = "hybrid"

class StockLevel(str, Enum):
    CRITICAL = "critical"
    LOW = "low"
    ADEQUATE = "adequate"
    OPTIMAL = "optimal"
    EXCESS = "excess"

class RecommendationType(str, Enum):
    EMERGENCY_ORDER = "emergency_order"
    ROUTINE_ORDER = "routine_order"
    HOLD_ORDER = "hold_order"
    REDUCE_ORDER = "reduce_order"
    REDISTRIBUTE = "redistribute"

@dataclass
class OptimizationConstraints:
    """Optimization constraints and parameters"""
    max_storage_capacity: int = 1000
    min_safety_stock_days: int = 7
    max_order_frequency_days: int = 3
    budget_constraint: float = 100000.0
    emergency_cost_multiplier: float = 2.5
    wastage_penalty_factor: float = 1.5
    shelf_life_buffer_days: int = 5

class DemandForecast(BaseModel):
    """Demand forecast model"""
    blood_type: BloodType
    forecast_date: datetime
    predicted_demand: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    forecast_horizon_days: int
    model_accuracy: Optional[float] = None

class BloodInventoryMetrics(BaseModel):
    """Blood inventory metrics for optimization"""
    blood_type: BloodType
    current_stock: int
    safety_stock_level: int
    reorder_point: int
    economic_order_quantity: int
    days_of_supply: float
    wastage_rate: float = Field(ge=0, le=1)
    cost_per_unit: float = Field(gt=0)
    shelf_life_days: int = Field(gt=0)
    storage_capacity: int = Field(gt=0)

class OptimizationRecommendation(BaseModel):
    """Inventory optimization recommendation"""
    recommendation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    blood_type: BloodType
    current_stock_level: StockLevel
    recommendation_type: RecommendationType
    recommended_order_quantity: int
    priority_level: Priority
    cost_estimate: float
    expected_delivery_date: datetime
    reasoning: str
    confidence_score: float = Field(ge=0, le=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OptimizationReport(BaseModel):
    """Comprehensive optimization report"""
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    total_recommendations: int
    total_estimated_cost: float
    budget_utilization: float
    recommendations: List[OptimizationRecommendation]
    risk_assessment: Dict[str, Any]
    performance_metrics: Dict[str, float]

class InventoryOptimizer:
    """Main inventory optimization engine"""
    
    def __init__(self, constraints: OptimizationConstraints = None):
        self.constraints = constraints or OptimizationConstraints()
        self.forecasting_client = ForecastingServiceClient()
        self.ingestion_client = IngestionServiceClient()
        
    async def optimize_inventory(
        self,
        db: AsyncIOMotorDatabase,
        optimization_method: OptimizationMethod = OptimizationMethod.LINEAR_PROGRAMMING,
        forecast_horizon_days: int = 30
    ) -> OptimizationReport:
        """Main optimization function that generates inventory recommendations"""
        try:
            # 1. Get current inventory status
            inventory_data = await self._get_current_inventory(db)
            
            # 2. Get demand forecasts
            forecasts = await self._get_demand_forecasts(forecast_horizon_days)
            
            # 3. Calculate inventory metrics
            metrics = await self._calculate_inventory_metrics(inventory_data, forecasts)
            
            # 4. Generate recommendations based on optimization method
            if optimization_method == OptimizationMethod.LINEAR_PROGRAMMING:
                recommendations = await self._linear_programming_optimization(metrics, forecasts)
            elif optimization_method == OptimizationMethod.REINFORCEMENT_LEARNING:
                recommendations = await self._reinforcement_learning_optimization(metrics, forecasts)
            else:
                recommendations = await self._hybrid_optimization(metrics, forecasts)
            
            # 5. Perform risk assessment
            risk_assessment = await self._assess_risks(recommendations, metrics)
            
            # 6. Calculate performance metrics
            performance_metrics = await self._calculate_performance_metrics(recommendations)
            
            # 7. Generate comprehensive report
            report = OptimizationReport(
                total_recommendations=len(recommendations),
                total_estimated_cost=sum(r.cost_estimate for r in recommendations),
                budget_utilization=sum(r.cost_estimate for r in recommendations) / self.constraints.budget_constraint,
                recommendations=recommendations,
                risk_assessment=risk_assessment,
                performance_metrics=performance_metrics
            )
            
            # 8. Store report in database
            await self._save_optimization_report(db, report)
            
            return report
            
        except Exception as e:
            logger.error(f"Error in inventory optimization: {e}")
            raise
    
    async def _get_current_inventory(self, db: AsyncIOMotorDatabase) -> Dict[str, Dict]:
        """Get current inventory status from database"""
        try:
            inventory_pipeline = [
                {
                    "$match": {
                        "status": {"$in": ["available", "reserved", "near_expiry"]}
                    }
                },
                {
                    "$group": {
                        "_id": "$blood_type",
                        "total_units": {"$sum": 1},
                        "available_units": {
                            "$sum": {"$cond": [{"$eq": ["$status", "available"]}, 1, 0]}
                        },
                        "reserved_units": {
                            "$sum": {"$cond": [{"$eq": ["$status", "reserved"]}, 1, 0]}
                        },
                        "near_expiry_units": {
                            "$sum": {"$cond": [{"$eq": ["$status", "near_expiry"]}, 1, 0]}
                        },
                        "avg_days_to_expiry": {
                            "$avg": {
                                "$divide": [
                                    {"$subtract": ["$expiry_date", datetime.utcnow()]},
                                    86400000  # Convert to days
                                ]
                            }
                        }
                    }
                }
            ]
            
            cursor = db.blood_inventory.aggregate(inventory_pipeline)
            results = await cursor.to_list(length=None)
            
            inventory_data = {}
            for result in results:
                blood_type_str = result["_id"]
                inventory_data[blood_type_str] = {
                    "total_units": result["total_units"],
                    "available_units": result["available_units"],
                    "reserved_units": result["reserved_units"],
                    "near_expiry_units": result["near_expiry_units"],
                    "avg_days_to_expiry": max(0, result.get("avg_days_to_expiry", 0))
                }
            
            return inventory_data
            
        except Exception as e:
            logger.error(f"Error getting current inventory: {e}")
            raise
    
    async def _get_demand_forecasts(self, horizon_days: int) -> List[DemandForecast]:
        """Get demand forecasts from forecasting service"""
        try:
            forecasts = []
            blood_types = [bt.value for bt in BloodType]
            
            for blood_type in blood_types:
                forecast_data = await self.forecasting_client.get_forecast(blood_type, horizon_days)
                
                if forecast_data:
                    forecasts.append(DemandForecast(
                        blood_type=BloodType(blood_type),
                        forecast_date=datetime.utcnow(),
                        predicted_demand=forecast_data.get("predicted_demand", 0),
                        confidence_interval_lower=forecast_data.get("confidence_lower", 0),
                        confidence_interval_upper=forecast_data.get("confidence_upper", 0),
                        forecast_horizon_days=horizon_days,
                        model_accuracy=forecast_data.get("accuracy", 0.8)
                    ))
                else:
                    # Use fallback forecast
                    forecasts.append(await self._get_fallback_forecast(BloodType(blood_type), horizon_days))
            
            return forecasts
            
        except Exception as e:
            logger.error(f"Error getting demand forecasts: {e}")
            # Return fallback forecasts for all blood types
            return [await self._get_fallback_forecast(bt, horizon_days) for bt in BloodType]
    
    async def _calculate_inventory_metrics(
        self, 
        inventory_data: Dict[str, Dict], 
        forecasts: List[DemandForecast]
    ) -> List[BloodInventoryMetrics]:
        """Calculate inventory metrics for optimization"""
        metrics = []
        
        for forecast in forecasts:
            blood_type_str = forecast.blood_type.value if hasattr(forecast.blood_type, 'value') else str(forecast.blood_type)
            inventory = inventory_data.get(blood_type_str, {})
            
            current_stock = inventory.get("available_units", 0)
            daily_demand = forecast.predicted_demand / forecast.forecast_horizon_days
            
            # Calculate Economic Order Quantity (EOQ)
            annual_demand = daily_demand * 365
            ordering_cost = 500  # Estimated cost per order
            holding_cost = 10   # Estimated holding cost per unit per year
            
            if annual_demand > 0 and holding_cost > 0:
                eoq = int(np.sqrt((2 * annual_demand * ordering_cost) / holding_cost))
            else:
                eoq = max(1, int(daily_demand * 7))  # 1 week supply as fallback
            
            # Calculate safety stock and reorder point
            lead_time_days = 3  # Assumed lead time
            demand_std = (forecast.confidence_interval_upper - forecast.confidence_interval_lower) / 4
            
            safety_stock = int(1.645 * demand_std * np.sqrt(lead_time_days))  # 95% service level
            reorder_point = int(daily_demand * lead_time_days) + safety_stock
            
            # Calculate days of supply
            days_of_supply = current_stock / daily_demand if daily_demand > 0 else float('inf')
            
            # Estimate wastage rate based on shelf life
            avg_shelf_life = inventory.get("avg_days_to_expiry", 35)
            wastage_rate = max(0, min(0.15, (35 - avg_shelf_life) / 35 * 0.15))
            
            metrics.append(BloodInventoryMetrics(
                blood_type=forecast.blood_type,
                current_stock=current_stock,
                safety_stock_level=safety_stock,
                reorder_point=reorder_point,
                economic_order_quantity=eoq,
                days_of_supply=days_of_supply,
                wastage_rate=wastage_rate,
                cost_per_unit=self._get_unit_cost(forecast.blood_type),
                shelf_life_days=int(avg_shelf_life),
                storage_capacity=self.constraints.max_storage_capacity
            ))
        
        return metrics
    
    async def _linear_programming_optimization(
        self, 
        metrics: List[BloodInventoryMetrics], 
        forecasts: List[DemandForecast]
    ) -> List[OptimizationRecommendation]:
        """Linear programming optimization approach"""
        recommendations = []
        
        try:
            # Create optimization problem
            prob = LpProblem("Blood_Inventory_Optimization", LpMinimize)
            
            # Decision variables
            order_vars = {}
            for metric in metrics:
                blood_type = metric.blood_type
                max_order = min(metric.economic_order_quantity * 2, 
                              self.constraints.max_storage_capacity - metric.current_stock)
                order_vars[blood_type] = LpVariable(
                    f"order_{blood_type}", 
                    lowBound=0, 
                    upBound=max_order, 
                    cat='Integer'
                )
            
            # Objective function: minimize total cost
            total_cost = 0
            for metric in metrics:
                blood_type = metric.blood_type
                
                # Ordering cost
                ordering_cost = metric.cost_per_unit * order_vars[blood_type]
                
                # Holding cost
                holding_cost = 10 * order_vars[blood_type]  # Estimated holding cost
                
                # Emergency cost (if below safety stock)
                emergency_cost = 0
                if metric.current_stock < metric.safety_stock_level:
                    shortage = metric.safety_stock_level - metric.current_stock
                    emergency_cost = shortage * metric.cost_per_unit * self.constraints.emergency_cost_multiplier
                
                # Wastage cost
                wastage_cost = order_vars[blood_type] * metric.wastage_rate * metric.cost_per_unit * self.constraints.wastage_penalty_factor
                
                total_cost += ordering_cost + holding_cost + emergency_cost + wastage_cost
            
            prob += total_cost
            
            # Constraints
            
            # Budget constraint
            total_order_cost = lpSum([
                metric.cost_per_unit * order_vars[metric.blood_type] 
                for metric in metrics
            ])
            prob += total_order_cost <= self.constraints.budget_constraint
            
            # Storage capacity constraint
            total_inventory_after_order = lpSum([
                metric.current_stock + order_vars[metric.blood_type] 
                for metric in metrics
            ])
            prob += total_inventory_after_order <= self.constraints.max_storage_capacity
            
            # Safety stock constraints
            for metric in metrics:
                forecast = next(f for f in forecasts if f.blood_type == metric.blood_type)
                expected_demand = forecast.predicted_demand
                
                # Ensure we meet demand + safety stock
                prob += (metric.current_stock + order_vars[metric.blood_type] - expected_demand) >= metric.safety_stock_level
            
            # Solve the problem
            prob.solve()
            
            # Generate recommendations
            for metric in metrics:
                blood_type = metric.blood_type
                recommended_quantity = int(value(order_vars[blood_type]) or 0)
                
                # Determine recommendation type and priority
                if metric.current_stock < metric.safety_stock_level:
                    rec_type = RecommendationType.EMERGENCY_ORDER
                    priority = Priority.EMERGENCY
                elif metric.current_stock < metric.reorder_point:
                    rec_type = RecommendationType.ROUTINE_ORDER
                    priority = Priority.HIGH
                elif recommended_quantity == 0:
                    rec_type = RecommendationType.HOLD_ORDER
                    priority = Priority.LOW
                else:
                    rec_type = RecommendationType.ROUTINE_ORDER
                    priority = Priority.MEDIUM
                
                # Calculate cost estimate
                cost_estimate = recommended_quantity * metric.cost_per_unit
                if rec_type == RecommendationType.EMERGENCY_ORDER:
                    cost_estimate *= self.constraints.emergency_cost_multiplier
                
                # Generate reasoning
                reasoning = self._generate_reasoning(metric, recommended_quantity, rec_type)
                
                # Calculate confidence score
                confidence_score = self._calculate_confidence_score(metric, recommended_quantity)
                
                recommendations.append(OptimizationRecommendation(
                    blood_type=blood_type,
                    current_stock_level=self._classify_stock_level(metric),
                    recommendation_type=rec_type,
                    recommended_order_quantity=recommended_quantity,
                    priority_level=priority,
                    cost_estimate=cost_estimate,
                    expected_delivery_date=datetime.utcnow() + timedelta(days=3),
                    reasoning=reasoning,
                    confidence_score=confidence_score
                ))
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in linear programming optimization: {e}")
            # Fallback to simple heuristic approach
            return await self._heuristic_optimization(metrics, forecasts)
    
    async def _reinforcement_learning_optimization(
        self, 
        metrics: List[BloodInventoryMetrics], 
        forecasts: List[DemandForecast]
    ) -> List[OptimizationRecommendation]:
        """Reinforcement learning optimization approach"""
        recommendations = []
        
        for metric in metrics:
            blood_type = metric.blood_type
            
            # Create state representation
            state = {
                'stock_level': metric.current_stock / metric.storage_capacity,
                'demand_trend': 0.5,  # Placeholder
                'days_of_supply': min(1.0, metric.days_of_supply / 30),
                'wastage_risk': metric.wastage_rate
            }
            
            # Evaluate actions using Q-learning
            actions = ['order_high', 'order_medium', 'order_low', 'hold']
            q_values = [self._calculate_q_value(state, action) for action in actions]
            best_action = actions[np.argmax(q_values)]
            
            # Determine recommendation based on best action
            if best_action == 'order_high':
                recommended_quantity = int(metric.economic_order_quantity * 1.5)
                rec_type = RecommendationType.EMERGENCY_ORDER
                priority = Priority.EMERGENCY
            elif best_action == 'order_medium':
                recommended_quantity = metric.economic_order_quantity
                rec_type = RecommendationType.ROUTINE_ORDER
                priority = Priority.HIGH
            elif best_action == 'order_low':
                recommended_quantity = int(metric.economic_order_quantity * 0.5)
                rec_type = RecommendationType.ROUTINE_ORDER
                priority = Priority.MEDIUM
            else:
                recommended_quantity = 0
                rec_type = RecommendationType.HOLD_ORDER
                priority = Priority.LOW
            
            cost_estimate = recommended_quantity * metric.cost_per_unit
            if rec_type == RecommendationType.EMERGENCY_ORDER:
                cost_estimate *= self.constraints.emergency_cost_multiplier
            
            recommendations.append(OptimizationRecommendation(
                blood_type=blood_type,
                current_stock_level=self._classify_stock_level(metric),
                recommendation_type=rec_type,
                recommended_order_quantity=recommended_quantity,
                priority_level=priority,
                cost_estimate=cost_estimate,
                expected_delivery_date=datetime.utcnow() + timedelta(days=3),
                reasoning=self._generate_reasoning(metric, recommended_quantity, rec_type),
                confidence_score=self._calculate_confidence_score(metric, recommended_quantity)
            ))
        
        return recommendations

    async def _rl_refine_quantity(self, metric: BloodInventoryMetrics, initial_quantity: int) -> int:
        """Use RL to refine order quantity"""
        state = {
            'stock_level': metric.current_stock / metric.storage_capacity,
            'demand_trend': 0.5,
            'days_of_supply': min(1.0, metric.days_of_supply / 30),
            'wastage_risk': metric.wastage_rate
        }
        
        actions = ['order_high', 'order_medium', 'order_low', 'hold']
        q_values = [self._calculate_q_value(state, action) for action in actions]
        
        best_action = actions[np.argmax(q_values)]
        
        if best_action == 'order_high':
            return int(initial_quantity * 1.2)
        elif best_action == 'order_medium':
            return initial_quantity
        elif best_action == 'order_low':
            return int(initial_quantity * 0.8)
        else:
            return 0

    async def _heuristic_optimization(
        self, 
        metrics: List[BloodInventoryMetrics], 
        forecasts: List[DemandForecast]
    ) -> List[OptimizationRecommendation]:
        """Simple heuristic optimization fallback"""
        recommendations = []
        
        for metric in metrics:
            blood_type = metric.blood_type
            
            if metric.current_stock < metric.safety_stock_level:
                recommended_quantity = metric.economic_order_quantity
                rec_type = RecommendationType.EMERGENCY_ORDER
                priority = Priority.EMERGENCY
            elif metric.current_stock < metric.reorder_point:
                recommended_quantity = metric.economic_order_quantity
                rec_type = RecommendationType.ROUTINE_ORDER
                priority = Priority.HIGH
            else:
                recommended_quantity = 0
                rec_type = RecommendationType.HOLD_ORDER
                priority = Priority.LOW
            
            cost_estimate = recommended_quantity * metric.cost_per_unit
            if rec_type == RecommendationType.EMERGENCY_ORDER:
                cost_estimate *= self.constraints.emergency_cost_multiplier
            
            recommendations.append(OptimizationRecommendation(
                blood_type=blood_type,
                current_stock_level=self._classify_stock_level(metric),
                recommendation_type=rec_type,
                recommended_order_quantity=recommended_quantity,
                priority_level=priority,
                cost_estimate=cost_estimate,
                expected_delivery_date=datetime.utcnow() + timedelta(days=3),
                reasoning=self._generate_reasoning(metric, recommended_quantity, rec_type),
                confidence_score=self._calculate_confidence_score(metric, recommended_quantity)
            ))
        
        return recommendations
    
    def _calculate_q_value(self, state: Dict[str, float], action: str) -> float:
        """Calculate Q-value for RL optimization (simplified)"""
        stock_level = state['stock_level']
        demand_trend = state['demand_trend']
        days_supply = state['days_of_supply']
        wastage_risk = state['wastage_risk']
        
        if action == 'order_high':
            return 50 - (stock_level * 30) + (demand_trend * 20) - (wastage_risk * 15)
        elif action == 'order_medium':
            return 40 - (stock_level * 20) + (demand_trend * 15) - (wastage_risk * 10)
        elif action == 'order_low':
            return 30 - (stock_level * 10) + (demand_trend * 10) - (wastage_risk * 5)
        else:  # hold
            return 20 + (stock_level * 15) - (demand_trend * 10)
    
    def _classify_stock_level(self, metric: BloodInventoryMetrics) -> StockLevel:
        """Classify current stock level"""
        if metric.current_stock == 0:
            return StockLevel.CRITICAL
        elif metric.current_stock < metric.safety_stock_level:
            return StockLevel.LOW
        elif metric.current_stock < metric.reorder_point:
            return StockLevel.ADEQUATE
        elif metric.current_stock <= metric.economic_order_quantity:
            return StockLevel.OPTIMAL
        else:
            return StockLevel.EXCESS
    
    def _generate_reasoning(
        self, 
        metric: BloodInventoryMetrics, 
        recommended_quantity: int, 
        rec_type: RecommendationType
    ) -> str:
        """Generate human-readable reasoning for recommendation"""
        
        if rec_type == RecommendationType.EMERGENCY_ORDER:
            return (f"URGENT: Current stock ({metric.current_stock}) is below safety level "
                   f"({metric.safety_stock_level}). Immediate replenishment of {recommended_quantity} units needed.")
        
        elif rec_type == RecommendationType.ROUTINE_ORDER:
            return (f"Routine reorder triggered. Current stock ({metric.current_stock}) below reorder point "
                   f"({metric.reorder_point}). Optimal order quantity: {recommended_quantity} units.")
        
        elif rec_type == RecommendationType.HOLD_ORDER:
            return (f"Stock level adequate ({metric.current_stock} units, {metric.days_of_supply:.1f} days supply). "
                   f"No immediate order required.")
        
        elif rec_type == RecommendationType.REDUCE_ORDER:
            return (f"Excess inventory detected. Current stock ({metric.current_stock}) exceeds optimal levels. "
                   f"Consider reducing order quantity to {recommended_quantity}.")
        
        else:
            return f"Standard inventory management: Order {recommended_quantity} units based on EOQ model."
    
    def _calculate_confidence_score(
        self, 
        metric: BloodInventoryMetrics, 
        recommended_quantity: int
    ) -> float:
        """Calculate confidence score for recommendation"""
        try:
            # Base confidence from stock level assessment
            if metric.current_stock < metric.safety_stock_level:
                base_confidence = 0.9  # High confidence for emergency orders
            elif metric.current_stock < metric.reorder_point:
                base_confidence = 0.8  # Good confidence for routine orders
            else:
                base_confidence = 0.7  # Moderate confidence for hold orders
            
            # Adjust based on wastage rate
            wastage_penalty = metric.wastage_rate * 0.2
            
            # Adjust based on days of supply
            if metric.days_of_supply < 7:
                supply_bonus = 0.1
            elif metric.days_of_supply > 30:
                supply_bonus = -0.1
            else:
                supply_bonus = 0
            
            confidence = base_confidence - wastage_penalty + supply_bonus
            return max(0.1, min(1.0, confidence))
        
        except Exception as e:
            logger.error(f"Error calculating confidence score: {e}")
            return 0.5
    
    def _get_unit_cost(self, blood_type: BloodType) -> float:
        """Get cost per unit for blood type"""
        cost_map = {
            BloodType.A_POSITIVE: 150.0,
            BloodType.A_NEGATIVE: 175.0,
            BloodType.B_POSITIVE: 150.0,
            BloodType.B_NEGATIVE: 175.0,
            BloodType.AB_POSITIVE: 200.0,
            BloodType.AB_NEGATIVE: 225.0,
            BloodType.O_POSITIVE: 125.0,
            BloodType.O_NEGATIVE: 250.0
        }
        return cost_map.get(blood_type, 150.0)
    
    async def _get_fallback_forecast(self, blood_type: BloodType, horizon_days: int) -> DemandForecast:
        """Generate fallback forecast using historical averages"""
        # Simple fallback - in production, use historical data
        base_demand = {
            BloodType.O_POSITIVE: 40,
            BloodType.O_NEGATIVE: 15,
            BloodType.A_POSITIVE: 30,
            BloodType.A_NEGATIVE: 10,
            BloodType.B_POSITIVE: 20,
            BloodType.B_NEGATIVE: 8,
            BloodType.AB_POSITIVE: 12,
            BloodType.AB_NEGATIVE: 5
        }
        
        predicted = base_demand.get(blood_type, 20) * horizon_days
        return DemandForecast(
            blood_type=blood_type,
            forecast_date=datetime.utcnow(),
            predicted_demand=predicted,
            confidence_interval_lower=predicted * 0.8,
            confidence_interval_upper=predicted * 1.2,
            forecast_horizon_days=horizon_days,
            model_accuracy=0.7
        )
    
    async def _assess_risks(
        self, 
        recommendations: List[OptimizationRecommendation], 
        metrics: List[BloodInventoryMetrics]
    ) -> Dict[str, Any]:
        """Assess risks associated with recommendations"""
        try:
            total_recommendations = len(recommendations)
            emergency_orders = sum(1 for r in recommendations if r.recommendation_type == RecommendationType.EMERGENCY_ORDER)
            high_cost_orders = sum(1 for r in recommendations if r.cost_estimate > 10000)
            
            # Calculate risk scores
            supply_risk = emergency_orders / total_recommendations if total_recommendations > 0 else 0
            cost_risk = sum(r.cost_estimate for r in recommendations) / self.constraints.budget_constraint
            wastage_risk = sum(m.wastage_rate for m in metrics) / len(metrics) if metrics else 0
            
            overall_risk = (supply_risk * 0.4 + cost_risk * 0.4 + wastage_risk * 0.2)
            
            return {
                "overall_risk_score": min(1.0, overall_risk),
                "supply_risk": supply_risk,
                "cost_risk": cost_risk,
                "wastage_risk": wastage_risk,
                "emergency_orders_count": emergency_orders,
                "high_cost_orders_count": high_cost_orders,
                "risk_level": "high" if overall_risk > 0.7 else "medium" if overall_risk > 0.4 else "low"
            }
        except Exception as e:
            logger.error(f"Error assessing risks: {e}")
            return {"overall_risk_score": 0.5, "risk_level": "unknown"}
    
    async def _calculate_performance_metrics(
        self, 
        recommendations: List[OptimizationRecommendation]
    ) -> Dict[str, float]:
        """Calculate performance metrics for recommendations"""
        try:
            if not recommendations:
                return {"optimization_score": 0.0}
            
            total_recommendations = len(recommendations)
            emergency_orders = sum(1 for r in recommendations if r.recommendation_type == RecommendationType.EMERGENCY_ORDER)
            total_cost = sum(r.cost_estimate for r in recommendations)
            avg_confidence = sum(r.confidence_score for r in recommendations) / total_recommendations
            
            # Service level (inverse of emergency ratio)
            service_level = 1.0 - (emergency_orders / total_recommendations)
            
            # Cost efficiency (budget utilization vs service level)
            budget_utilization = total_cost / self.constraints.budget_constraint
            cost_efficiency = service_level / max(budget_utilization, 0.1)
            
            # Overall optimization score
            optimization_score = (service_level * 0.4 + cost_efficiency * 0.3 + avg_confidence * 0.3)
            
            return {
                "optimization_score": min(1.0, optimization_score),
                "service_level": service_level,
                "cost_efficiency": min(1.0, cost_efficiency),
                "average_confidence": avg_confidence,
                "emergency_order_ratio": emergency_orders / total_recommendations,
                "total_estimated_cost": total_cost,
                "budget_utilization": budget_utilization
            }
        except Exception as e:
            logger.error(f"Error calculating performance metrics: {e}")
            return {"optimization_score": 0.5}
    
    async def _save_optimization_report(self, db: AsyncIOMotorDatabase, report: OptimizationReport):
        """Save optimization report to database"""
        try:
            report_dict = report.dict()
            await db.optimization_reports.insert_one(report_dict)
            logger.info(f"Optimization report saved: {report.report_id}")
        except Exception as e:
            logger.error(f"Error saving optimization report: {e}")


class ForecastingServiceClient:
    """Client for forecasting service integration"""
    
    def __init__(self):
        self.base_url = FORECASTING_SERVICE_URL
        self.timeout = aiohttp.ClientTimeout(total=30)
    
    async def get_forecast(self, blood_type: str, horizon_days: int) -> Optional[Dict[str, Any]]:
        """Get demand forecast from forecasting service"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                url = f"{self.base_url}/forecast/{blood_type}"
                params = {"horizon_days": horizon_days}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.warning(f"Forecasting service returned status {response.status}")
                        return None
        except Exception as e:
            logger.warning(f"Failed to get forecast: {e}")
            return None


class IngestionServiceClient:
    """Client for data ingestion service integration"""
    
    def __init__(self):
        self.base_url = INGESTION_SERVICE_URL
        self.timeout = aiohttp.ClientTimeout(total=30)
    
    async def get_historical_data(self, blood_type: str, days: int) -> Optional[Dict[str, Any]]:
        """Get historical demand data"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                url = f"{self.base_url}/historical/{blood_type}"
                params = {"days": days}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.warning(f"Ingestion service returned status {response.status}")
                        return None
        except Exception as e:
            logger.warning(f"Failed to get historical data: {e}")
            return None


# FastAPI Application
app = FastAPI(
    title="Blood Bank Inventory Optimization Service",
    description=(
        "AI-Enhanced Blood Bank Inventory Optimization System - Track 3\n"
        "Douala General Hospital\n\n"
        "This service synthesizes forecasting outputs and real-time stock data to generate "
        "optimal ordering recommendations, accounting for delivery cycles, safety stock, "
        "wastage rates, and cost implications."
    ),
    version="1.0.0"
)

# Global optimizer instance
optimizer = InventoryOptimizer()

# ============================================================================
# OPTIMIZATION ENDPOINTS
# ============================================================================

@app.post("/optimize", response_model=OptimizationReport)
async def optimize_inventory(
    optimization_method: OptimizationMethod = Body(OptimizationMethod.LINEAR_PROGRAMMING),
    forecast_horizon_days: int = Body(30, ge=7, le=90),
    constraints: Optional[OptimizationConstraints] = Body(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> OptimizationReport:
    """
    Generate optimal inventory recommendations using specified optimization method
    """
    try:
        # Update constraints if provided
        if constraints:
            optimizer.constraints = constraints
        
        # Run optimization
        report = await optimizer.optimize_inventory(
            db=db,
            optimization_method=optimization_method,
            forecast_horizon_days=forecast_horizon_days
        )
        
        logger.info(f"Inventory optimization completed: {report.report_id} by user {current_user.get('user_id')}")
        
        return report
        
    except Exception as e:
        logger.error(f"Error in inventory optimization: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize inventory")


@app.get("/optimize/quick")
async def quick_optimization(
    blood_type: Optional[BloodType] = None,
    method: OptimizationMethod = OptimizationMethod.LINEAR_PROGRAMMING,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Quick optimization for specific blood type or all types with minimal configuration
    """
    try:
        # Use default constraints for quick optimization
        quick_constraints = OptimizationConstraints(
            max_storage_capacity=500,
            min_safety_stock_days=5,
            budget_constraint=50000.0
        )
        
        temp_optimizer = InventoryOptimizer(quick_constraints)
        
        report = await temp_optimizer.optimize_inventory(
            db=db,
            optimization_method=method,
            forecast_horizon_days=14
        )
        
        # Filter by blood type if specified
        if blood_type:
            filtered_recommendations = [
                rec for rec in report.recommendations 
                if rec.blood_type == blood_type
            ]
            
            return {
                "blood_type": blood_type,
                "recommendations": filtered_recommendations,
                "total_cost": sum(r.cost_estimate for r in filtered_recommendations),
                "optimization_method": method,
                "generated_at": datetime.utcnow()
            }
        
        return {
            "report_summary": {
                "total_recommendations": report.total_recommendations,
                "total_cost": report.total_estimated_cost,
                "budget_utilization": report.budget_utilization,
                "optimization_score": report.performance_metrics.get("optimization_score", 0)
            },
            "top_priority_recommendations": [
                rec for rec in report.recommendations 
                if rec.priority_level == Priority.EMERGENCY
            ][:5],
            "optimization_method": method,
            "generated_at": report.generated_at
        }
        
    except Exception as e:
        logger.error(f"Error in quick optimization: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform quick optimization")


@app.get("/reports/{report_id}")
async def get_optimization_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get optimization report by ID"""
    try:
        report = await db.optimization_reports.find_one({"report_id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Optimization report not found")
        
        # Convert ObjectId to string
        if "_id" in report:
            report["_id"] = str(report["_id"])
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving optimization report: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve optimization report")


@app.get("/reports")
async def list_optimization_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """List optimization reports with pagination"""
    try:
        query = {}
        
        # Get total count
        total = await db.optimization_reports.count_documents(query)
        
        # Get reports
        cursor = db.optimization_reports.find(
            query, 
            {"report_id": 1, "generated_at": 1, "total_recommendations": 1, 
             "total_estimated_cost": 1, "budget_utilization": 1, "performance_metrics": 1}
        ).skip(skip).limit(limit).sort("generated_at", -1)
        
        reports = await cursor.to_list(length=None)
        
        # Convert ObjectIds to strings
        for report in reports:
            if "_id" in report:
                report["_id"] = str(report["_id"])
        
        return {
            "reports": reports,
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": skip + limit < total
        }
        
    except Exception as e:
        logger.error(f"Error listing optimization reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve optimization reports")


# ============================================================================
# RECOMMENDATION ENDPOINTS
# ============================================================================

@app.get("/recommendations/active")
async def get_active_recommendations(
    priority: Optional[Priority] = None,
    blood_type: Optional[BloodType] = None,
    recommendation_type: Optional[RecommendationType] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get active recommendations from the latest optimization report"""
    try:
        # Get the latest optimization report
        latest_report = await db.optimization_reports.find_one(
            {},
            sort=[("generated_at", -1)]
        )
        
        if not latest_report:
            return {
                "recommendations": [],
                "message": "No optimization reports found"
            }
        
        recommendations = latest_report.get("recommendations", [])
        
        # Filter recommendations
        if priority:
            recommendations = [r for r in recommendations if r.get("priority_level") == priority]
        
        if blood_type:
            recommendations = [r for r in recommendations if r.get("blood_type") == blood_type]
        
        if recommendation_type:
            recommendations = [r for r in recommendations if r.get("recommendation_type") == recommendation_type]
        
        return {
            "recommendations": recommendations,
            "report_id": latest_report.get("report_id"),
            "generated_at": latest_report.get("generated_at"),
            "total_filtered": len(recommendations)
        }
        
    except Exception as e:
        logger.error(f"Error getting active recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve active recommendations")


@app.post("/recommendations/{recommendation_id}/execute")
async def execute_recommendation(
    recommendation_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Execute a specific recommendation (create purchase order)"""
    try:
        # Find the recommendation in the latest report
        latest_report = await db.optimization_reports.find_one(
            {},
            sort=[("generated_at", -1)]
        )
        
        if not latest_report:
            raise HTTPException(status_code=404, detail="No optimization reports found")
        
        recommendation = None
        for rec in latest_report.get("recommendations", []):
            if rec.get("recommendation_id") == recommendation_id:
                recommendation = rec
                break
        
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        # Create purchase order record
        purchase_order = {
            "order_id": f"PO_{recommendation_id[:8]}_{int(datetime.utcnow().timestamp())}",
            "recommendation_id": recommendation_id,
            "blood_type": recommendation["blood_type"],
            "quantity": recommendation["recommended_order_quantity"],
            "estimated_cost": recommendation["cost_estimate"],
            "priority": recommendation["priority_level"],
            "status": "pending",
            "created_by": current_user.get("user_id"),
            "created_at": datetime.utcnow(),
            "expected_delivery": recommendation["expected_delivery_date"]
        }
        
        result = await db.purchase_orders.insert_one(purchase_order)
        
        # Add background task to update inventory projections
        background_tasks.add_task(
            update_inventory_projections,
            db, 
            recommendation["blood_type"],
            recommendation["recommended_order_quantity"]
        )
        
        logger.info(f"Purchase order created: {purchase_order['order_id']} by user {current_user.get('user_id')}")
        
        return {
            "order_id": purchase_order["order_id"],
            "status": "created",
            "message": "Purchase order created successfully",
            "recommendation_executed": recommendation_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing recommendation: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute recommendation")


# ============================================================================
# ANALYTICS AND MONITORING ENDPOINTS
# ============================================================================

@app.get("/analytics/optimization-performance")
async def get_optimization_performance(
    days: int = Query(30, ge=7, le=365),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get optimization performance analytics over time"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get optimization reports in date range
        cursor = db.optimization_reports.find(
            {"generated_at": {"$gte": start_date}},
            {"generated_at": 1, "performance_metrics": 1, "total_recommendations": 1, 
             "total_estimated_cost": 1, "budget_utilization": 1}
        ).sort("generated_at", 1)
        
        reports = await cursor.to_list(length=None)
        
        if not reports:
            return {
                "message": "No optimization reports found in the specified period",
                "period_days": days
            }
        
        # Calculate performance trends
        performance_data = []
        for report in reports:
            metrics = report.get("performance_metrics", {})
            performance_data.append({
                "date": report["generated_at"],
                "optimization_score": metrics.get("optimization_score", 0),
                "service_level": metrics.get("service_level", 0),
                "cost_efficiency": metrics.get("cost_efficiency", 0),
                "budget_utilization": report.get("budget_utilization", 0),
                "total_recommendations": report.get("total_recommendations", 0)
            })
        
        # Calculate averages
        avg_metrics = {
            "avg_optimization_score": sum(p["optimization_score"] for p in performance_data) / len(performance_data),
            "avg_service_level": sum(p["service_level"] for p in performance_data) / len(performance_data),
            "avg_cost_efficiency": sum(p["cost_efficiency"] for p in performance_data) / len(performance_data),
            "avg_budget_utilization": sum(p["budget_utilization"] for p in performance_data) / len(performance_data)
        }
        
        return {
            "period_days": days,
            "total_reports": len(reports),
            "performance_trend": performance_data,
            "average_metrics": avg_metrics,
            "latest_score": performance_data[-1]["optimization_score"] if performance_data else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting optimization performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve optimization performance")


@app.get("/analytics/cost-savings")
async def get_cost_savings_analysis(
    days: int = Query(30, ge=7, le=365),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Analyze cost savings from optimization recommendations"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get executed purchase orders
        executed_orders = await db.purchase_orders.find({
            "created_at": {"$gte": start_date},
            "status": {"$in": ["completed", "delivered"]}
        }).to_list(length=None)
        
        # Calculate actual vs estimated costs
        total_estimated = sum(order.get("estimated_cost", 0) for order in executed_orders)
        total_actual = sum(order.get("actual_cost", order.get("estimated_cost", 0)) for order in executed_orders)
        
        savings = max(0, total_estimated - total_actual)
        savings_percentage = (savings / total_estimated * 100) if total_estimated > 0 else 0
        
        # Analyze by blood type
        blood_type_analysis = {}
        for order in executed_orders:
            blood_type = order.get("blood_type")
            if blood_type not in blood_type_analysis:
                blood_type_analysis[blood_type] = {
                    "orders": 0,
                    "estimated_cost": 0,
                    "actual_cost": 0,
                    "savings": 0
                }
            
            blood_type_analysis[blood_type]["orders"] += 1
            blood_type_analysis[blood_type]["estimated_cost"] += order.get("estimated_cost", 0)
            blood_type_analysis[blood_type]["actual_cost"] += order.get("actual_cost", order.get("estimated_cost", 0))
        
        # Calculate savings for each blood type
        for bt_data in blood_type_analysis.values():
            bt_data["savings"] = max(0, bt_data["estimated_cost"] - bt_data["actual_cost"])
        
        # Count emergency vs routine orders
        emergency_orders = len([o for o in executed_orders if o.get("priority") == "emergency"])
        routine_orders = len(executed_orders) - emergency_orders
        
        return {
            "period_days": days,
            "total_orders_executed": len(executed_orders),
            "total_estimated_cost": total_estimated,
            "total_actual_cost": total_actual,
            "total_savings": savings,
            "savings_percentage": savings_percentage,
            "emergency_orders": emergency_orders,
            "routine_orders": routine_orders,
            "blood_type_analysis": blood_type_analysis
        }
        
    except Exception as e:
        logger.error(f"Error getting cost savings analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cost savings analysis")


# ============================================================================
# CONFIGURATION AND MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/config/constraints")
async def get_optimization_constraints(
    current_user: dict = Depends(get_current_user)
) -> OptimizationConstraints:
    """Get current optimization constraints"""
    return optimizer.constraints


@app.put("/config/constraints")
async def update_optimization_constraints(
    constraints: OptimizationConstraints,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Update optimization constraints"""
    try:
        optimizer.constraints = constraints
        logger.info(f"Optimization constraints updated by user {current_user.get('user_id')}")
        
        return {
            "status": "success",
            "message": "Optimization constraints updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error updating optimization constraints: {e}")
        raise HTTPException(status_code=500, detail="Failed to update optimization constraints")


@app.get("/health")
async def health_check(
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict[str, Any]:
    """Health check endpoint"""
    try:
        # Test database connection
        await db.command('ping')
        
        # Test forecasting service connection
        forecasting_status = "unknown"
        try:
            client = ForecastingServiceClient()
            forecast_test = await client.get_forecast("O_POSITIVE", 7)
            forecasting_status = "connected" if forecast_test else "disconnected"
        except:
            forecasting_status = "disconnected"
        
        return {
            "status": "healthy",
            "service": "blood_bank_inventory_optimization",
            "version": "1.0.0",
            "database": "connected",
            "forecasting_service": forecasting_status,
            "optimization_methods": [method.value for method in OptimizationMethod],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "blood_bank_inventory_optimization",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


# ============================================================================
# BACKGROUND TASKS
# ============================================================================

async def update_inventory_projections(
    db: AsyncIOMotorDatabase, 
    blood_type: str, 
    order_quantity: int
):
    """Background task to update inventory projections"""
    try:
        await db.inventory_projections.update_one(
            {"blood_type": blood_type},
            {
                "$inc": {"projected_stock": order_quantity},
                "$set": {"last_updated": datetime.utcnow()}
            },
            upsert=True
        )
        logger.info(f"Updated inventory projection for {blood_type}: +{order_quantity}")
    except Exception as e:
        logger.error(f"Error updating inventory projections: {e}")

# ====================Updated i========================================order_======NDPOINT
# ============================================================================

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with service information"""
    return {
        "service": "blood_bank_inventory_optimization",
        "status": "running",
        "version": "1.0.0",
        "description": "AI-Enhanced Blood Bank Inventory Optimization System - Track 3",
        "hospital": "Douala General Hospital",
        "optimization_methods": [method.value for method in OptimizationMethod],
        "endpoints": {
            "optimization": ["/optimize", "/optimize/quick"],
            "recommendations": ["/recommendations/active", "/recommendations/{id}/execute"],
            "reports": ["/reports", "/reports/{id}"],
            "analytics": ["/analytics/optimization-performance", "/analytics/cost-savings"],
            "configuration": ["/config/constraints"],
            "health": ["/health"]
        }
    }

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongo()
    logger.info("Connected to MongoDB")

@app.on_event("shutdown") 
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongo_connection()
    logger.info("Disconnected from MongoDB")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
